"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";

export interface SendMessageState {
  error: string | null;
  message?: {
    id: string;
    createdAt: string;
  };
}

export interface SendPhotoState {
  error: string | null;
  message?: {
    id: string;
    createdAt: string;
    photoKey: string;
    photoUrl: string;
  };
}

const MAX_TEXT_LENGTH = 4000;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

// Shared participant gate. Confirms the current user owns either the donor or
// farmer side of this tree and returns their inferred from_role. Mirrors the
// RLS policy `messages_insert_participants` so we get the same guarantees
// even though the admin client bypasses RLS.
async function resolveParticipant(
  treeId: string,
): Promise<
  | { ok: true; fromRole: "donor" | "farmer"; userId: string }
  | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "You're signed out — please log in again." };
  }

  const supabase = createAdminClient();
  const { data: tree, error: treeErr } = await supabase
    .from("trees")
    .select("id, farmer_id, donor_id")
    .eq("id", treeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (treeErr) return { ok: false, error: treeErr.message };
  if (!tree) return { ok: false, error: "Tree not found." };

  if (profile.role === "donor" && tree.donor_id === profile.donor_id) {
    return { ok: true, fromRole: "donor", userId: profile.user_id };
  }
  if (
    profile.role === "farmer" &&
    tree.farmer_id === profile.farmer_id
  ) {
    return { ok: true, fromRole: "farmer", userId: profile.user_id };
  }
  return { ok: false, error: "You're not part of this thread." };
}

// Posts a text message into a tree's thread on behalf of the signed-in donor
// or farmer.
export async function sendMessage(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const treeId = ((formData.get("tree_id") as string) ?? "").trim();
  const text = ((formData.get("text") as string) ?? "").trim();

  if (!treeId) return { error: "Missing tree id." };
  if (!text) return { error: "Message is empty." };
  if (text.length > MAX_TEXT_LENGTH) {
    return { error: `Message too long (max ${MAX_TEXT_LENGTH} chars).` };
  }

  const participant = await resolveParticipant(treeId);
  if (!participant.ok) return { error: participant.error };
  const { fromRole, userId } = participant;

  const supabase = createAdminClient();

  // No translation pipeline yet — store the same text in both columns and
  // mark the language as English. Farmer Hindi → English translation is a
  // follow-up task; doing it inline would slow every send and is out of scope
  // for this slice.
  const { data: inserted, error: insertErr } = await supabase
    .from("messages")
    .insert({
      tree_id: treeId,
      from_user_id: userId,
      from_role: fromRole,
      kind: "text",
      text_original: text,
      text_en: text,
      text_lang: "en",
    })
    .select("id, created_at")
    .single();
  if (insertErr) return { error: insertErr.message };

  // Keep the tree's last_update_at fresh so the farmer workspace's "needs
  // update" filter and the donor's "last activity" indicator both stay sane.
  await supabase
    .from("trees")
    .update({ last_update_at: inserted.created_at })
    .eq("id", treeId);

  revalidatePath("/donor");
  revalidatePath("/farmer");

  return {
    error: null,
    message: { id: inserted.id, createdAt: inserted.created_at },
  };
}

// Posts a photo into the thread. Client compresses before upload, but we
// keep a server-side ceiling as a sanity bound. tree-photos is public so the
// returned URL doesn't need signing — both donor and farmer can render it
// directly.
export async function sendPhotoMessage(
  _prev: SendPhotoState,
  formData: FormData,
): Promise<SendPhotoState> {
  const treeId = ((formData.get("tree_id") as string) ?? "").trim();
  const caption =
    ((formData.get("caption") as string) ?? "").trim() || null;
  const photo = formData.get("photo");

  if (!treeId) return { error: "Missing tree id." };
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Please pick a photo first." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return {
      error: `Photo is too large (${Math.round(photo.size / 1024)}KB) — compression should have brought it under 4MB.`,
    };
  }
  if (!photo.type.startsWith("image/")) {
    return { error: "Attachment must be an image." };
  }

  const participant = await resolveParticipant(treeId);
  if (!participant.ok) return { error: participant.error };
  const { fromRole, userId } = participant;

  const supabase = createAdminClient();

  const photoKey = `${treeId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("tree-photos")
    .upload(photoKey, photo, {
      contentType: photo.type || "image/jpeg",
      upsert: false,
    });
  if (uploadError) {
    return { error: `Could not upload photo: ${uploadError.message}` };
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("messages")
    .insert({
      tree_id: treeId,
      from_user_id: userId,
      from_role: fromRole,
      kind: "photo",
      photo_key: photoKey,
      caption_original: caption,
      caption_en: caption,
    })
    .select("id, created_at")
    .single();
  if (insertErr) return { error: insertErr.message };

  await supabase
    .from("trees")
    .update({ last_update_at: inserted.created_at })
    .eq("id", treeId);

  const { data: publicData } = supabase.storage
    .from("tree-photos")
    .getPublicUrl(photoKey);

  revalidatePath("/donor");
  revalidatePath("/farmer");

  return {
    error: null,
    message: {
      id: inserted.id,
      createdAt: inserted.created_at,
      photoKey,
      photoUrl: publicData.publicUrl,
    },
  };
}
