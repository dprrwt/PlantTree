"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

export interface DistrictFormState {
  error: string | null;
}

function parseFormData(formData: FormData) {
  const speciesRaw = (formData.get("species") as string) ?? "";
  return {
    id: ((formData.get("id") as string) ?? "").trim(),
    name: ((formData.get("name") as string) ?? "").trim(),
    elevation: ((formData.get("elevation") as string) ?? "").trim(),
    x: Number(formData.get("x")) || 0,
    y: Number(formData.get("y")) || 0,
    summary: ((formData.get("summary") as string) ?? "").trim(),
    soil: ((formData.get("soil") as string) ?? "").trim(),
    rainfall: ((formData.get("rainfall") as string) ?? "").trim(),
    species: speciesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    why: ((formData.get("why") as string) ?? "").trim(),
    history: ((formData.get("history") as string) ?? "").trim(),
    field_notes: ((formData.get("field_notes") as string) ?? "").trim(),
    canopy: Number(formData.get("canopy")) || 0,
    fire_risk: ((formData.get("fire_risk") as string) ?? "").trim(),
    trees_planted: Number(formData.get("trees_planted")) || 0,
    farmers_count: Number(formData.get("farmers_count")) || 0,
    priority: ((formData.get("priority") as string) ?? "medium") as
      | "critical"
      | "high"
      | "medium",
    status: ((formData.get("status") as string) ?? "researching") as
      | "researching"
      | "field-visited"
      | "active"
      | "coming_next",
    active_since:
      ((formData.get("active_since") as string) ?? "").trim() || null,
  };
}

function validate(data: ReturnType<typeof parseFormData>): string | null {
  if (!data.id) return "Slug (id) is required.";
  if (!/^[a-z0-9-]+$/.test(data.id))
    return "Slug must be lowercase letters, numbers, or hyphens only.";
  if (!data.name) return "Name is required.";
  if (!data.elevation) return "Elevation is required (e.g. '1,650 m').";
  if (data.x < 0 || data.x > 100) return "Map x must be between 0 and 100.";
  if (data.y < 0 || data.y > 100) return "Map y must be between 0 and 100.";
  if (!data.summary) return "Summary is required.";
  if (!data.soil) return "Soil is required.";
  if (!data.rainfall) return "Rainfall is required.";
  if (!data.why) return "Why (the pitch) is required.";
  if (!data.history) return "History is required.";
  if (!data.field_notes) return "Field notes are required.";
  if (data.canopy < 0 || data.canopy > 100)
    return "Canopy must be 0–100.";
  if (!data.fire_risk) return "Fire risk is required.";
  return null;
}

export async function createDistrict(
  _prev: DistrictFormState,
  formData: FormData,
): Promise<DistrictFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  const supabase = createAdminClient();
  const { error: dbError } = await supabase.from("districts").insert(data);
  if (dbError) {
    if (dbError.code === "23505") {
      return { error: `A district with id "${data.id}" already exists.` };
    }
    return { error: dbError.message };
  }

  revalidatePath("/admin/districts");
  revalidatePath("/admin");
  redirect("/admin/districts");
}

export async function updateDistrict(
  id: string,
  _prev: DistrictFormState,
  formData: FormData,
): Promise<DistrictFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  const { id: _ignored, ...updates } = data;
  const supabase = createAdminClient();
  const { error: dbError } = await supabase
    .from("districts")
    .update(updates)
    .eq("id", id);
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/districts");
  revalidatePath(`/admin/districts/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/districts");
}

export async function softDeleteDistrict(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase
    .from("districts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/districts");
  revalidatePath("/admin");
}

export async function restoreDistrict(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase.from("districts").update({ deleted_at: null }).eq("id", id);
  revalidatePath("/admin/districts");
  revalidatePath("/admin");
}
