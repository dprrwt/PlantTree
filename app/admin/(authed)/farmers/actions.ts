"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

export interface FarmerFormState {
  error: string | null;
}

function parseFormData(formData: FormData) {
  const plantsRaw = (formData.get("plants") as string) ?? "";
  return {
    id: ((formData.get("id") as string) ?? "").trim(),
    name: ((formData.get("name") as string) ?? "").trim(),
    village: ((formData.get("village") as string) ?? "").trim(),
    district_id: ((formData.get("district_id") as string) ?? "").trim(),
    upi: ((formData.get("upi") as string) ?? "").trim(),
    phone: ((formData.get("phone") as string) ?? "").trim(),
    rate: Number(formData.get("rate")) || 0,
    rate_care: Number(formData.get("rate_care")) || 0,
    years: Number(formData.get("years")) || 0,
    plot: ((formData.get("plot") as string) ?? "").trim() || null,
    quote_original: ((formData.get("quote_original") as string) ?? "").trim() || null,
    quote_en: ((formData.get("quote_en") as string) ?? "").trim() || null,
    plants: plantsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    photo_tone: ((formData.get("photo_tone") as string) ?? "moss") as
      | "moss"
      | "terra"
      | "neutral",
    verified_by_org:
      ((formData.get("verified_by_org") as string) ?? "").trim() || null,
    verified_at: ((formData.get("verified_at") as string) ?? "").trim() || null,
    status: ((formData.get("status") as string) ?? "active") as
      | "active"
      | "pending"
      | "inactive",
  };
}

function validate(data: ReturnType<typeof parseFormData>): string | null {
  if (!data.id) return "Slug (id) is required.";
  if (!/^[a-z0-9-]+$/.test(data.id))
    return "Slug must be lowercase letters, numbers, or hyphens only.";
  if (!data.name) return "Name is required.";
  if (!data.village) return "Village is required.";
  if (!data.district_id) return "District is required.";
  if (!data.upi) return "UPI is required.";
  if (!data.phone) return "Phone is required.";
  if (data.rate < 0) return "Rate must be 0 or greater.";
  if (data.rate_care < 0) return "Rate (with care) must be 0 or greater.";
  return null;
}

export async function createFarmer(
  _prev: FarmerFormState,
  formData: FormData,
): Promise<FarmerFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  const supabase = createAdminClient();
  const { error: dbError } = await supabase.from("farmers").insert(data);
  if (dbError) {
    if (dbError.code === "23505") {
      return { error: `A farmer with id "${data.id}" already exists.` };
    }
    return { error: dbError.message };
  }

  revalidatePath("/admin/farmers");
  revalidatePath("/admin");
  redirect("/admin/farmers");
}

export async function updateFarmer(
  id: string,
  _prev: FarmerFormState,
  formData: FormData,
): Promise<FarmerFormState> {
  await requireOperator();
  const data = parseFormData(formData);
  const error = validate(data);
  if (error) return { error };

  // id is the primary key — don't allow renames in v1.
  const { id: _ignored, ...updates } = data;
  const supabase = createAdminClient();
  const { error: dbError } = await supabase
    .from("farmers")
    .update(updates)
    .eq("id", id);
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/farmers");
  revalidatePath(`/admin/farmers/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/farmers");
}

export async function softDeleteFarmer(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase
    .from("farmers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/farmers");
  revalidatePath("/admin");
}

export async function restoreFarmer(id: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();
  await supabase.from("farmers").update({ deleted_at: null }).eq("id", id);
  revalidatePath("/admin/farmers");
  revalidatePath("/admin");
}
