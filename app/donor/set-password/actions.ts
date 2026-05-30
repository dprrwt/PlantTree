"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SetPasswordState {
  error: string | null;
}

export async function setDonorPassword(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your recovery link has expired. Ask the operator to re-send your password setup email.",
    };
  }

  const { error: updateErr } = await supabase.auth.updateUser({ password });
  if (updateErr) {
    return { error: updateErr.message };
  }

  // Confirm the email by virtue of having clicked the link.
  redirect("/donor");
}
