"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth";

export interface FarmerLoginActionState {
  error: string | null;
  ok?: boolean;
}

export interface FarmerLoginStatus {
  hasLogin: boolean;
  email: string | null;
  userId: string | null;
}

export async function getFarmerLoginStatus(
  farmerId: string,
): Promise<FarmerLoginStatus> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("role", "farmer")
    .eq("farmer_id", farmerId)
    .maybeSingle();

  if (!profile) return { hasLogin: false, email: null, userId: null };

  const { data: userData } = await supabase.auth.admin.getUserById(
    profile.user_id,
  );
  return {
    hasLogin: true,
    email: userData.user?.email ?? null,
    userId: profile.user_id,
  };
}

export async function createFarmerLogin(
  farmerId: string,
  _prev: FarmerLoginActionState,
  formData: FormData,
): Promise<FarmerLoginActionState> {
  await requireOperator();

  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That doesn't look like a valid email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createAdminClient();

  // Make sure the farmer exists.
  const { data: farmer } = await supabase
    .from("farmers")
    .select("id, name")
    .eq("id", farmerId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!farmer) return { error: "Farmer not found." };

  // Already has a login?
  const existingStatus = await getFarmerLoginStatus(farmerId);
  if (existingStatus.hasLogin) {
    return {
      error: `${farmer.name} already has a login (${existingStatus.email}). Use Reset password to change it.`,
    };
  }

  // Create auth user (auto-confirmed since the operator is vouching).
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { farmer_id: farmerId, farmer_name: farmer.name },
  });
  if (authError) {
    if (authError.message.includes("already") || authError.message.includes("registered")) {
      return {
        error: `An account with email ${email} already exists. Use a different email.`,
      };
    }
    return { error: authError.message };
  }
  const userId = created.user?.id;
  if (!userId) return { error: "Account created but no user id returned." };

  // Link the auth user to the farmer via profiles.
  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: userId,
    role: "farmer",
    farmer_id: farmerId,
  });
  if (profileError) {
    // Roll back: delete the auth user if profile insert failed.
    await supabase.auth.admin.deleteUser(userId);
    return { error: `Profile link failed: ${profileError.message}` };
  }

  revalidatePath(`/admin/farmers/${farmerId}/edit`);
  return { error: null, ok: true };
}

export async function deleteFarmerLogin(farmerId: string): Promise<void> {
  await requireOperator();
  const supabase = createAdminClient();

  const status = await getFarmerLoginStatus(farmerId);
  if (!status.hasLogin || !status.userId) {
    return; // already gone
  }

  // Deleting the auth user cascades to profiles via the ON DELETE CASCADE FK.
  await supabase.auth.admin.deleteUser(status.userId);

  revalidatePath(`/admin/farmers/${farmerId}/edit`);
}

export async function resetFarmerPassword(
  farmerId: string,
  _prev: FarmerLoginActionState,
  formData: FormData,
): Promise<FarmerLoginActionState> {
  await requireOperator();
  const password = (formData.get("password") as string) ?? "";
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const status = await getFarmerLoginStatus(farmerId);
  if (!status.hasLogin || !status.userId) {
    return { error: "This farmer has no login yet." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(status.userId, {
    password,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/farmers/${farmerId}/edit`);
  return { error: null, ok: true };
}
