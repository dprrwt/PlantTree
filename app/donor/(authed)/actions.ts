"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDonor } from "@/lib/auth";

// Donor settings — the only two a donor can change: their display name (shown on
// tree pages, certificates, and the public registry) and whether their grove is
// public. Gated to the signed-in donor; only ever updates their own row.
export async function updateDonorSettings(input: {
  displayName?: string;
  isPublic?: boolean;
}): Promise<{ displayName: string; isPublic: boolean }> {
  const profile = await requireDonor();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (typeof input.displayName === "string") {
    const name = input.displayName.trim();
    if (!name) throw new Error("Display name can't be empty.");
    updates.display_name = name;
  }
  if (typeof input.isPublic === "boolean") {
    updates.is_public = input.isPublic;
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("Nothing to update.");
  }

  const { data, error } = await supabase
    .from("donors")
    .update(updates)
    .eq("id", profile.donor_id)
    .select("display_name, is_public")
    .maybeSingle();
  if (error) throw error;

  // Name flows into tree pages, certificates, and the registry; refresh them.
  revalidatePath("/donor");
  revalidatePath("/groves");

  return {
    displayName: data?.display_name ?? input.displayName ?? "",
    isPublic: data?.is_public ?? input.isPublic ?? false,
  };
}
