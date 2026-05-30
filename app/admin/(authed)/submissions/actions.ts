"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

// Rough acres-bucket → hectares, so a promoted plot carries a usable area until
// the site visit measures it properly. null when the contributor didn't know.
const SIZE_TO_HA: Record<string, number> = {
  "Under ½ acre": 0.2,
  "½ – 1 acre": 0.3,
  "1 – 3 acres": 0.8,
  "More than 3 acres": 1.5,
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "plot"
  );
}

// Promote a public submission into the researching → field-visited → planting
// lifecycle: create a plot and/or farmer row, link them, mark it promoted.
export async function promoteSubmission(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();

  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (subErr) throw subErr;
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "new") {
    throw new Error(`Submission is "${sub.status}", not "new" — already handled.`);
  }

  const needPlot = sub.adding === "plot" || sub.adding === "both";
  const needFarmer = sub.adding === "farmer" || sub.adding === "both";

  // Resolve the district to its slug id (FK target). "Other / not listed" and
  // unknown names can't be promoted blind — the operator adds the district first.
  const { data: districtRow } = await supabase
    .from("districts")
    .select("id, name")
    .ilike("name", (sub.district ?? "").trim())
    .is("deleted_at", null)
    .maybeSingle();
  if (!districtRow) {
    throw new Error(
      `District "${sub.district ?? "—"}" isn't in the system yet. Add it in /admin/districts, then promote.`,
    );
  }
  const districtId = districtRow.id as string;
  const suffix = randomBytes(3).toString("hex");

  let plotId: string | null = null;
  let farmerId: string | null = null;

  if (needPlot) {
    plotId = `plot-${slugify(sub.village || sub.district || "land")}-${suffix}`;
    const { error: plotErr } = await supabase.from("plots").insert({
      id: plotId,
      name: sub.village ? `${sub.village} (suggested)` : "Suggested plot",
      name_en: "Contributed plot · awaiting site visit",
      village: sub.village ?? "—",
      district_id: districtId,
      lat: sub.lat,
      lng: sub.lng,
      area_ha: sub.land_size ? (SIZE_TO_HA[sub.land_size] ?? null) : null,
      water_source: sub.water ?? null,
      status: "researching",
      description:
        [sub.land_state, sub.note].filter(Boolean).join(" — ") || null,
      photo_tone: "moss",
    });
    if (plotErr) throw plotErr;
  }

  if (needFarmer) {
    farmerId = `${slugify((sub.farmer_name || sub.contributor_name || "farmer").split(" ")[0])}-${suffix}`;
    const { error: farmerErr } = await supabase.from("farmers").insert({
      id: farmerId,
      name: sub.farmer_name ?? sub.contributor_name ?? "—",
      village: sub.village ?? "—",
      district_id: districtId,
      upi: "pending@upi",
      phone: sub.phone ?? "pending",
      years: 0,
      rate: 0,
      rate_care: 0,
      photo_tone: "moss",
      status: "pending",
      verified_by_org: sub.org_name ?? null,
    });
    if (farmerErr) throw farmerErr;
  }

  // Link them when both were contributed.
  if (plotId && farmerId) {
    const { error: linkErr } = await supabase
      .from("farmer_plots")
      .insert({ farmer_id: farmerId, plot_id: plotId, role: "primary" });
    if (linkErr) throw linkErr;
  }

  const { error: updErr } = await supabase
    .from("submissions")
    .update({
      status: "promoted",
      promoted_plot_id: plotId,
      promoted_farmer_id: farmerId,
    })
    .eq("id", id);
  if (updErr) throw updErr;

  revalidatePath("/admin");
  revalidatePath("/admin/plots");
  revalidatePath("/admin/farmers");
}

export async function dismissSubmission(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("submissions")
    .update({ status: "dismissed" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}
