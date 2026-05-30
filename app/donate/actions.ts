"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DonationSubmitState {
  error: string | null;
  donationId?: string;
  reference?: string;
  amount?: number;
  paymentProofUrl?: string | null;
}

const TIER_MAP: Record<string, "plant_only" | "plant_care" | "grove_of_5"> = {
  plant: "plant_only",
  care: "plant_care",
  grove: "grove_of_5",
};

// Defense-in-depth bound on what the server will accept. The client compresses
// to ~150KB before upload, so anything above 4MB is either an uncompressed file
// (compression bug, browser fallback failed) or an attempt to abuse the action.
const MAX_PROOF_BYTES = 4 * 1024 * 1024;

export async function submitDonation(
  _prev: DonationSubmitState,
  formData: FormData,
): Promise<DonationSubmitState> {
  const farmerId = ((formData.get("farmer_id") as string) ?? "").trim();
  const plan = ((formData.get("plan") as string) ?? "").trim();
  const donorName = ((formData.get("donor_name") as string) ?? "").trim();
  const donorEmail =
    ((formData.get("donor_email") as string) ?? "").trim() || null;
  const donorPhone =
    ((formData.get("donor_phone") as string) ?? "").trim() || null;
  const isAnonymous = formData.get("is_anonymous") === "on";
  const paymentMethod =
    ((formData.get("payment_method") as string) ?? "upi_manual").trim();
  const proof = formData.get("payment_proof");

  if (!farmerId) return { error: "Farmer is required." };
  if (!plan) return { error: "Pick a plan first." };
  if (!donorName)
    return { error: "Your name is required (or pick anonymous)." };
  if (!donorEmail && !donorPhone)
    return { error: "Email or phone is required so we can reach you." };
  if (!(proof instanceof File) || proof.size === 0) {
    return {
      error:
        "Attach your UPI payment screenshot — we can't verify without it.",
    };
  }
  if (proof.size > MAX_PROOF_BYTES) {
    return {
      error: `Screenshot is too large (${Math.round(proof.size / 1024)}KB). Please try again — compression should have brought it under 4MB.`,
    };
  }
  if (!proof.type.startsWith("image/")) {
    return { error: "Payment proof must be an image (JPG or PNG)." };
  }

  const tier = TIER_MAP[plan];
  if (!tier) return { error: `Unknown plan "${plan}".` };

  const supabase = createAdminClient();

  const { data: farmer, error: farmerError } = await supabase
    .from("farmers")
    .select("rate, rate_care, name")
    .eq("id", farmerId)
    .is("deleted_at", null)
    .maybeSingle();
  if (farmerError) return { error: farmerError.message };
  if (!farmer) return { error: "Farmer not found." };

  let amount = 0;
  if (tier === "plant_only") amount = farmer.rate;
  else if (tier === "plant_care") amount = farmer.rate_care;
  else if (tier === "grove_of_5") amount = 5 * farmer.rate_care;

  // Upload proof first — if Storage fails we don't want orphan donor/donation
  // rows. The key is opaque; donation row carries the reference.
  const proofKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(proofKey, proof, {
      contentType: proof.type || "image/jpeg",
      upsert: false,
    });
  if (uploadError) {
    return { error: `Could not upload screenshot: ${uploadError.message}` };
  }

  const { data: donor, error: donorError } = await supabase
    .from("donors")
    .insert({
      display_name: isAnonymous ? "Anonymous" : donorName,
      email: donorEmail,
      phone: donorPhone,
      is_anonymous: isAnonymous,
    })
    .select("id")
    .single();
  if (donorError) return { error: donorError.message };

  // 7-day plant deadline + 14-day refund deadline
  const now = new Date();
  const duePlantAt = new Date(now.getTime() + 7 * 86400000).toISOString();
  const dueRefundAt = new Date(now.getTime() + 14 * 86400000).toISOString();

  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      donor_id: donor.id,
      farmer_id: farmerId,
      amount_inr: amount,
      tier,
      payment_method: paymentMethod,
      payment_proof_key: proofKey,
      status: "pending_verify",
      is_anonymous: isAnonymous,
      due_plant_at: duePlantAt,
      due_refund_at: dueRefundAt,
    })
    .select("id")
    .single();
  if (donationError) return { error: donationError.message };

  await supabase.from("donation_events").insert({
    donation_id: donation.id,
    from_status: null,
    to_status: "pending_verify",
    note: `Donor submitted payment confirmation + screenshot for ${farmer.name} · ${tier} · ₹${amount}`,
  });

  // Sign a short-lived URL for the screenshot so the optimistic success-screen
  // thread can render it from Supabase (same source the operator + the donor
  // see after verification) instead of a local blob URL that dies on reload.
  const { data: signed } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(proofKey, 3600);
  const paymentProofUrl = signed?.signedUrl ?? null;

  // Refresh the operator dashboard so the new pending donation shows up.
  revalidatePath("/admin");
  revalidatePath("/admin/farmers");

  const reference = donation.id.slice(-8).toUpperCase();
  return {
    error: null,
    donationId: donation.id,
    reference,
    amount,
    paymentProofUrl,
  };
}
