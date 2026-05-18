"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

export interface PlotFormState {
  error: string | null;
}

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseFormData(formData: FormData) {
  const N = num(formData.get("soil_N"));
  const P = num(formData.get("soil_P"));
  const K = num(formData.get("soil_K"));
  const pH = num(formData.get("soil_pH"));
  const OM = num(formData.get("soil_OM"));
  const hasSoil = [N, P, K, pH, OM].some((v) => v !== null);
  const soil = hasSoil
    ? { N: N ?? 0, P: P ?? 0, K: K ?? 0, pH: pH ?? 0, OM: OM ?? 0 }
    : null;

  return {
    id: ((formData.get("id") as string) ?? "").trim(),
    name: ((formData.get("name") as string) ?? "").trim(),
    name_en: ((formData.get("name_en") as string) ?? "").trim(),
    village: ((formData.get("village") as string) ?? "").trim(),
    district_id: ((formData.get("district_id") as string) ?? "").trim(),
    lat: num(formData.get("lat")),
    lng: num(formData.get("lng")),
    area_ha: num(formData.get("area_ha")) ?? 0,
    elevation_m: num(formData.get("elevation_m")) ?? 0,
    slope_deg: num(formData.get("slope_deg")) ?? 0,
    aspect: ((formData.get("aspect") as string) ?? "").trim() || null,
    water_source:
      ((formData.get("water_source") as string) ?? "").trim() || null,
    land_tenure: ((formData.get("land_tenure") as string) ?? "private") as
      | "private"
      | "van-panchayat"
      | "community"
      | "lease",
    panchayat_verified: formData.get("panchayat_verified") === "on",
    soil,
    status: ((formData.get("status") as string) ?? "researching") as
      | "researching"
      | "field-visited"
      | "planting",
    joined_at: ((formData.get("joined_at") as string) ?? "").trim() || null,
    trees_planted: num(formData.get("trees_planted")) ?? 0,
    trees_alive: num(formData.get("trees_alive")) ?? 0,
    description:
      ((formData.get("description") as string) ?? "").trim() || null,
    photo_tone: ((formData.get("photo_tone") as string) ?? "moss") as
      | "moss"
      | "terra"
      | "neutral",
    primary_farmer_id:
      ((formData.get("primary_farmer_id") as string) ?? "").trim() || null,
    co_steward_ids: formData.getAll("co_steward_ids").map(String).filter(Boolean),
  };
}

function validate(data: ReturnType<typeof parseFormData>): string | null {
  if (!data.id) return "Slug (id) is required.";
  if (!/^[a-z0-9-]+$/.test(data.id))
    return "Slug must be lowercase letters, numbers, or hyphens only.";
  if (!data.name) return "Local name is required.";
  if (!data.name_en) return "English name is required.";
  if (!data.village) return "Village is required.";
  if (!data.district_id) return "District is required.";
  if (data.area_ha <= 0) return "Area (ha) must be greater than 0.";
  if (data.elevation_m <= 0) return "Elevation must be greater than 0.";
  if (data.slope_deg < 0 || data.slope_deg > 90)
    return "Slope must be 0–90 degrees.";
  if (data.lat !== null && (data.lat < -90 || data.lat > 90))
    return "Latitude must be -90 to 90.";
  if (data.lng !== null && (data.lng < -180 || data.lng > 180))
    return "Longitude must be -180 to 180.";
  if (!data.primary_farmer_id)
    return "Pick a primary farmer (the on-ground steward).";
  if (data.co_steward_ids.includes(data.primary_farmer_id))
    return "The primary farmer can't also be in the co-stewards list.";
  return null;
}

async function syncFarmerPlots(
  plotId: string,
  primaryFarmerId: string | null,
  coStewardIds: string[],
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  // Clear existing links then re-insert; simple and durable for v1.
  const { error: delError } = await supabase
    .from("farmer_plots")
    .delete()
    .eq("plot_id", plotId);
  if (delError) return { error: delError.message };

  const links: { farmer_id: string; plot_id: string; role: string }[] = [];
  if (primaryFarmerId) {
    links.push({
      farmer_id: primaryFarmerId,
      plot_id: plotId,
      role: "primary",
    });
  }
  for (const farmerId of coStewardIds) {
    links.push({
      farmer_id: farmerId,
      plot_id: plotId,
      role: "co-steward",
    });
  }
  if (links.length > 0) {
    const { error: insError } = await supabase
      .from("farmer_plots")
      .insert(links);
    if (insError) return { error: insError.message };
  }
  return { error: null };
}

export async function createPlot(
  _prev: PlotFormState,
  formData: FormData,
): Promise<PlotFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  const supabase = createAdminClient();
  const { primary_farmer_id, co_steward_ids, ...plotFields } = data;
  const { error: dbError } = await supabase.from("plots").insert(plotFields);
  if (dbError) {
    if (dbError.code === "23505") {
      return { error: `A plot with id "${data.id}" already exists.` };
    }
    return { error: dbError.message };
  }

  const sync = await syncFarmerPlots(
    data.id,
    primary_farmer_id,
    co_steward_ids,
  );
  if (sync.error) return { error: `Plot saved but stewardship failed: ${sync.error}` };

  revalidatePath("/admin/plots");
  revalidatePath("/admin");
  redirect("/admin/plots");
}

export async function updatePlot(
  id: string,
  _prev: PlotFormState,
  formData: FormData,
): Promise<PlotFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  const supabase = createAdminClient();
  const { id: _ignored, primary_farmer_id, co_steward_ids, ...updates } = data;
  const { error: dbError } = await supabase
    .from("plots")
    .update(updates)
    .eq("id", id);
  if (dbError) return { error: dbError.message };

  const sync = await syncFarmerPlots(id, primary_farmer_id, co_steward_ids);
  if (sync.error) return { error: `Plot saved but stewardship failed: ${sync.error}` };

  revalidatePath("/admin/plots");
  revalidatePath(`/admin/plots/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/plots");
}

export async function softDeletePlot(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase
    .from("plots")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/plots");
  revalidatePath("/admin");
}

export async function restorePlot(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase.from("plots").update({ deleted_at: null }).eq("id", id);
  revalidatePath("/admin/plots");
  revalidatePath("/admin");
}
