// Server-side auth helpers. Use only from server components, server actions,
// or route handlers — never imported into a client component.
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  user_id: string;
  role: "donor" | "farmer" | "operator";
  farmer_id: string | null;
  donor_id: string | null;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("user_id, role, farmer_id, donor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data as Profile | null;
}

// Gate a server component / server action: redirects to /admin/login if the
// current session is missing or not an operator profile.
export async function requireOperator(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "operator") {
    redirect("/admin/login");
  }
  return profile;
}

// Gate the farmer workspace. Redirects to /farmer/login if not signed in as a
// farmer (or if the farmer record has been deleted).
export async function requireFarmer(): Promise<Profile & { farmer_id: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "farmer" || !profile.farmer_id) {
    redirect("/farmer/login");
  }
  return profile as Profile & { farmer_id: string };
}

// Gate the donor grove. Redirects to /donor/login if not signed in as a donor.
export async function requireDonor(): Promise<Profile & { donor_id: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "donor" || !profile.donor_id) {
    redirect("/donor/login");
  }
  return profile as Profile & { donor_id: string };
}
