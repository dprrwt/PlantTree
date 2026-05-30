"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Shape the client form sends us. Phone is OTP-verified on the client before
// submit (prototype accepts any 6 digits; production = real SMS OTP via
// MSG91/Gupshup). No account is created — quality is enforced by the form.
export interface ContributionInput {
  adding: "plot" | "farmer" | "both";
  who: string;
  name: string;
  phone: string;
  orgName?: string;
  orgReg?: string;
  orgRole?: string;
  orgDoc?: boolean;
  district: string;
  village: string;
  gps: { lat: number; lng: number } | null;
  size?: string;
  water?: string;
  landState?: string;
  owner?: string;
  photo?: boolean;
  farmerName?: string;
  farmerAgreed?: string;
  note?: string;
  trust: string[];
}

const PHONE_RE = /^[+0-9 ]{8,}$/;

export async function submitContribution(
  input: ContributionInput,
): Promise<{ ref: string }> {
  // Server-side mirror of the client validation — never trust the client.
  const needPlot = input.adding === "plot" || input.adding === "both";
  const needFarmer = input.adding === "farmer" || input.adding === "both";
  const isOrg = input.who === "ngo" || input.who === "panchayat";

  const fail = (msg: string): never => {
    throw new Error(msg);
  };

  if (!input.who) fail("Tell us who you are");
  if (!input.name?.trim()) fail("Your name is needed");
  if (!PHONE_RE.test(input.phone ?? "")) fail("A valid phone number is needed");
  if (!input.district) fail("Pick a district");
  if (!input.village?.trim()) fail("Village name is needed");
  if (isOrg && !input.orgName?.trim()) fail("Name the organisation");
  if (needPlot && (!input.landState || !input.owner?.trim() || !input.photo || !input.gps))
    fail("Land details are incomplete");
  if (needFarmer && (!input.farmerName?.trim() || !input.farmerAgreed))
    fail("Farmer details are incomplete");

  const supabase = createAdminClient();

  // id is allocated atomically by the submissions_ref_seq DB sequence (see
  // migration 0006) — we insert without one and read the generated value back,
  // so concurrent public submissions can't collide on a SUB-#### reference.
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      contributor_type: input.who,
      contributor_name: input.name.trim(),
      phone: input.phone.trim(),
      org_name: isOrg ? input.orgName?.trim() || null : null,
      org_reg: isOrg ? input.orgReg?.trim() || null : null,
      org_role: isOrg ? input.orgRole?.trim() || null : null,
      org_doc_url: isOrg && input.orgDoc ? "pending-upload" : null,
      adding: input.adding,
      district: input.district,
      village: input.village.trim(),
      lat: input.gps?.lat ?? null,
      lng: input.gps?.lng ?? null,
      land_size: needPlot ? input.size || null : null,
      water: needPlot ? input.water || null : null,
      land_state: needPlot ? input.landState || null : null,
      owner: needPlot ? input.owner?.trim() || null : null,
      photo_url: needPlot && input.photo ? "pending-upload" : null,
      farmer_name: needFarmer ? input.farmerName?.trim() || null : null,
      farmer_agreed: needFarmer ? input.farmerAgreed || null : null,
      note: input.note?.trim() || null,
      trust: input.trust ?? [],
      status: "new",
    })
    .select("id")
    .single();
  if (error) throw error;

  return { ref: data.id as string };
}
