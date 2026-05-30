"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

// Hand-curated lookup. Easier than another table for now; extend as new species
// get planted.
const SCIENTIFIC_NAMES: Record<string, string> = {
  "Banj oak": "Quercus leucotrichophora",
  "Tilonj oak": "Quercus floribunda",
  "Kharsu oak": "Quercus semecarpifolia",
  "Buransh": "Rhododendron arboreum",
  "Kafal": "Myrica esculenta",
  "Walnut": "Juglans regia",
  "Apricot": "Prunus armeniaca",
  "Bhimal": "Grewia optiva",
  "Deodar": "Cedrus deodara",
  "Bhojpatra": "Betula utilis",
  "Timur": "Zanthoxylum armatum",
};

const TIER_LABEL: Record<string, string> = {
  plant_only: "plant only",
  plant_care: "plant + 1 yr care",
  grove_of_5: "grove of 5",
};

async function nextTreeId(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trees")
    .select("id")
    .like("id", "PT-%")
    .order("id", { ascending: false })
    .limit(1);
  if (error) throw error;
  const lastId = data?.[0]?.id;
  const lastNum = lastId?.match(/^PT-(\d+)$/)?.[1];
  const next = (lastNum ? parseInt(lastNum, 10) : 0) + 1;
  return `PT-${String(next).padStart(3, "0")}`;
}

export async function verifyDonation(donationId: string): Promise<void> {
  const profile = await requireOperator();
  const supabase = createAdminClient();

  const { data: donation, error: donationErr } = await supabase
    .from("donations")
    .select(`
      id, donor_id, farmer_id, amount_inr, tier, status, payment_proof_key,
      donor:donors!donor_id (display_name, is_anonymous, email),
      farmer:farmers!farmer_id (id, name, plants, district_id)
    `)
    .eq("id", donationId)
    .maybeSingle();
  if (donationErr) throw donationErr;
  if (!donation) throw new Error("Donation not found");
  if (donation.status !== "pending_verify") {
    throw new Error(
      `Donation is "${donation.status}", not "pending_verify" — cannot verify.`,
    );
  }

  const farmer: any = donation.farmer;
  const donor: any = donation.donor;

  // Find this farmer's primary plot.
  const { data: primaryLinks, error: linkErr } = await supabase
    .from("farmer_plots")
    .select("plot_id")
    .eq("farmer_id", donation.farmer_id)
    .eq("role", "primary")
    .limit(1);
  if (linkErr) throw linkErr;
  const plotId = primaryLinks?.[0]?.plot_id;
  if (!plotId) {
    throw new Error(
      `${farmer.name} has no primary plot. Assign one in /admin/plots first.`,
    );
  }

  const species = (farmer.plants && farmer.plants[0]) ?? "—";
  const scientificName = SCIENTIFIC_NAMES[species] ?? "—";
  const treeId = await nextTreeId();

  // Create the tree. verify_token is the opaque secret printed on the cert
  // + receipt verify URLs — without it third parties can't pull the public
  // verification page for this tree.
  const verifyToken = randomBytes(6).toString("hex");
  const { error: treeErr } = await supabase.from("trees").insert({
    id: treeId,
    species,
    scientific_name: scientificName,
    farmer_id: donation.farmer_id,
    district_id: farmer.district_id,
    donor_id: donation.donor_id,
    plot_id: plotId,
    planted_at: null,
    stage: 0,
    height_m: 0,
    health_pct: null,
    visibility: "public",
    verify_token: verifyToken,
  });
  if (treeErr) throw treeErr;

  // Move donation forward
  const { error: updErr } = await supabase
    .from("donations")
    .update({
      tree_id: treeId,
      verified_at: new Date().toISOString(),
      verified_by: profile.user_id,
      status: "awaiting_plant",
    })
    .eq("id", donationId);
  if (updErr) throw updErr;

  // Open the message thread with a system message
  const donorName = donor?.is_anonymous ? "Anonymous" : donor?.display_name ?? "—";
  const tierLabel = TIER_LABEL[donation.tier] ?? donation.tier;
  const amountStr = `₹${donation.amount_inr.toLocaleString("en-IN")}`;
  const farmerFirstName = farmer.name.split(" ")[0];

  const { error: msgErr } = await supabase.from("messages").insert({
    tree_id: treeId,
    from_role: "system",
    kind: "thread-open",
    text_en: `Thread opened. ${amountStr} paid to ${farmerFirstName}-ji · ${species.toLowerCase()} · ${tierLabel} · for ${donorName}`,
    text_lang: "en",
  });
  if (msgErr) throw msgErr;

  // Forward the payment screenshot into the thread so the donor (after auth)
  // and the farmer both see it the moment the thread becomes visible.
  if (donation.payment_proof_key) {
    const { error: proofMsgErr } = await supabase.from("messages").insert({
      tree_id: treeId,
      from_role: "donor",
      kind: "payment-proof",
      text_en: "Payment screenshot",
      text_lang: "en",
      photo_key: donation.payment_proof_key,
    });
    if (proofMsgErr) throw proofMsgErr;
  }

  // Audit log
  await supabase.from("donation_events").insert({
    donation_id: donationId,
    from_status: "pending_verify",
    to_status: "awaiting_plant",
    actor_user_id: profile.user_id,
    note: `Verified · created tree ${treeId} on plot ${plotId}, species "${species}"`,
  });

  // Provision donor login (best-effort; doesn't fail verification if email is
  // missing or Supabase rejects the request).
  const donorEmail = (donor?.email as string | null) ?? null;
  const provisionResult = await provisionDonorAuth(
    donation.donor_id,
    donorEmail,
  );
  if (provisionResult.note) {
    await supabase.from("donation_events").insert({
      donation_id: donationId,
      from_status: "awaiting_plant",
      to_status: "awaiting_plant",
      actor_user_id: profile.user_id,
      note: `Donor auth: ${provisionResult.note}`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/farmers");
}

// Provisions a Supabase auth account for the donor and emails them an
// invitation so they can set their first password and access /donor.
// Idempotent — safe to run twice for the same donor.
async function provisionDonorAuth(
  donorId: string,
  email: string | null,
): Promise<{ ok: boolean; note: string }> {
  if (!email) {
    return {
      ok: false,
      note: "no email on donor row — donor can't be auto-provisioned",
    };
  }

  const supabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/callback?next=/donor/set-password`;
  const lowerEmail = email.toLowerCase();

  // Does a user with this email already exist?
  let userId: string | null = null;
  try {
    const { data: listed } = await supabase.auth.admin.listUsers();
    const existing = listed.users?.find(
      (u) => (u.email ?? "").toLowerCase() === lowerEmail,
    );
    if (existing) userId = existing.id;
  } catch {
    // fall through; we'll try the invite path below
  }

  let action: "invited" | "relinked";
  if (!userId) {
    // First-time donor — invite (creates user + sends a Supabase invitation email).
    const { data: invited, error: inviteErr } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { donor_id: donorId },
      });
    if (inviteErr) {
      return { ok: false, note: `inviteUserByEmail failed: ${inviteErr.message}` };
    }
    userId = invited.user?.id ?? null;
    if (!userId) return { ok: false, note: "invite returned no user id" };
    action = "invited";
  } else {
    // Existing account — just relink to the new donor row, no email.
    action = "relinked";
  }

  // Link the donor row to the auth user.
  await supabase
    .from("donors")
    .update({ auth_user_id: userId })
    .eq("id", donorId);

  // Insert profile (if missing).
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id, role, donor_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileErr } = await supabase.from("profiles").insert({
      user_id: userId,
      role: "donor",
      donor_id: donorId,
    });
    if (profileErr) {
      return {
        ok: false,
        note: `account ready but profile insert failed: ${profileErr.message}`,
      };
    }
  }

  return action === "invited"
    ? { ok: true, note: `invitation email sent to ${email}` }
    : { ok: true, note: `relinked existing account ${email} to this donor row` };
}

export async function rejectDonation(donationId: string): Promise<void> {
  const profile = await requireOperator();
  const supabase = createAdminClient();

  const { error: updErr } = await supabase
    .from("donations")
    .update({ status: "rejected" })
    .eq("id", donationId);
  if (updErr) throw updErr;

  await supabase.from("donation_events").insert({
    donation_id: donationId,
    from_status: "pending_verify",
    to_status: "rejected",
    actor_user_id: profile.user_id,
    note: "Rejected by operator (donor's payment couldn't be verified)",
  });

  revalidatePath("/admin");
}
