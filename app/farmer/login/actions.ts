"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface FarmerLoginState {
  error: string | null;
}

export async function loginFarmer(
  _prev: FarmerLoginState,
  formData: FormData,
): Promise<FarmerLoginState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign-in succeeded but session is missing." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "farmer") {
    await supabase.auth.signOut();
    return {
      error:
        "This account isn't a farmer login. Contact the PlantTree operator.",
    };
  }

  redirect("/farmer");
}
