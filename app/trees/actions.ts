"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireFarmer } from "@/lib/auth";

export interface PostTreeUpdateState {
  error: string | null;
  ok?: boolean;
}

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

// Posts a tree update from the farmer: optional photo + caption + new
// height/health, plus an optional "I planted this today" flip if the tree was
// still awaiting planting. Writes to four tables in one go (trees, donations,
// tree_updates, messages) so the donor's thread, grove timeline, and overdue
// queue all converge in a single round-trip.
export async function postTreeUpdate(
  _prev: PostTreeUpdateState,
  formData: FormData,
): Promise<PostTreeUpdateState> {
  const treeId = ((formData.get("tree_id") as string) ?? "").trim();
  const caption =
    ((formData.get("caption") as string) ?? "").trim() || null;
  const rawHeight = formData.get("height_m");
  const rawHealth = formData.get("health_pct");
  const markPlanted = formData.get("mark_planted") === "on";
  const photo = formData.get("photo");

  if (!treeId) return { error: "Missing tree id." };

  const heightM =
    typeof rawHeight === "string" && rawHeight !== ""
      ? Number(rawHeight)
      : null;
  const healthPct =
    typeof rawHealth === "string" && rawHealth !== ""
      ? Number(rawHealth)
      : null;
  if (heightM !== null && (isNaN(heightM) || heightM < 0 || heightM > 99)) {
    return { error: "Height must be between 0 and 99 metres." };
  }
  if (
    healthPct !== null &&
    (isNaN(healthPct) || healthPct < 0 || healthPct > 100)
  ) {
    return { error: "Health must be between 0 and 100." };
  }

  let photoFile: File | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return {
        error: `Photo too large (${Math.round(photo.size / 1024)}KB) — compression should have brought it under 4MB.`,
      };
    }
    if (!photo.type.startsWith("image/")) {
      return { error: "Attachment must be an image." };
    }
    photoFile = photo;
  }

  // Marking planted demands a photo — the donor needs the evidence and the
  // operator dashboard treats "planted with no photo" as suspicious.
  if (markPlanted && !photoFile) {
    return {
      error: "Add a photo of the planted sapling — donor will want to see it.",
    };
  }

  // Empty update with nothing to say: reject so the farmer doesn't post a
  // ghost row.
  if (!photoFile && !caption && heightM === null && healthPct === null && !markPlanted) {
    return { error: "Nothing to post — add a photo, note, or new metrics." };
  }

  const profile = await requireFarmer();
  const supabase = createAdminClient();

  // Confirm the farmer owns this tree before any writes.
  const { data: tree, error: treeErr } = await supabase
    .from("trees")
    .select("id, farmer_id, planted_at, stage")
    .eq("id", treeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (treeErr) return { error: treeErr.message };
  if (!tree) return { error: "Tree not found." };
  if (tree.farmer_id !== profile.farmer_id) {
    return { error: "This tree isn't on your plot." };
  }

  // Upload the photo first; if Storage fails we want to bail before any DB
  // writes land.
  let photoKey: string | null = null;
  if (photoFile) {
    photoKey = `${treeId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from("tree-photos")
      .upload(photoKey, photoFile, {
        contentType: photoFile.type || "image/jpeg",
        upsert: false,
      });
    if (uploadErr) {
      return { error: `Photo upload failed: ${uploadErr.message}` };
    }
  }

  const nowIso = new Date().toISOString();
  const willMarkPlanted = markPlanted && !tree.planted_at;

  // 1) trees: bump metrics + last_update_at; flip planted state if applicable.
  const treeUpdate: Record<string, unknown> = { last_update_at: nowIso };
  if (heightM !== null) treeUpdate.height_m = heightM;
  if (healthPct !== null) treeUpdate.health_pct = healthPct;
  if (willMarkPlanted) {
    treeUpdate.planted_at = nowIso.slice(0, 10);
    treeUpdate.stage = Math.max(tree.stage ?? 0, 1);
  }
  const { error: treeUpdErr } = await supabase
    .from("trees")
    .update(treeUpdate)
    .eq("id", treeId);
  if (treeUpdErr) return { error: treeUpdErr.message };

  // 2) donations: move awaiting_plant → planted when we just flipped planted.
  if (willMarkPlanted) {
    const { data: donations, error: donationErr } = await supabase
      .from("donations")
      .select("id")
      .eq("tree_id", treeId)
      .eq("status", "awaiting_plant");
    if (donationErr) return { error: donationErr.message };

    if (donations && donations.length > 0) {
      const ids = donations.map((d) => d.id);
      await supabase
        .from("donations")
        .update({ status: "planted" })
        .in("id", ids);
      // Audit each transition for the operator console.
      await supabase.from("donation_events").insert(
        ids.map((id) => ({
          donation_id: id,
          from_status: "awaiting_plant",
          to_status: "planted",
          actor_user_id: profile.user_id,
          note: `Farmer marked tree ${treeId} as planted`,
        })),
      );
    }
  }

  // 3) tree_updates: timeline row for the donor's grove view.
  if (photoFile || caption || heightM !== null || healthPct !== null) {
    const { error: updErr } = await supabase.from("tree_updates").insert({
      tree_id: treeId,
      posted_by: profile.user_id,
      photo_key: photoKey,
      caption_original: caption,
      caption_en: caption,
      caption_lang: "en",
      height_m: heightM,
      health_pct: healthPct,
    });
    if (updErr) return { error: updErr.message };
  }

  // 4) messages: system 'planting' notice (if marking planted) and a 'photo'
  // bubble with the actual image so the donor sees it in chat live.
  if (willMarkPlanted) {
    const { error: sysMsgErr } = await supabase.from("messages").insert({
      tree_id: treeId,
      from_role: "system",
      kind: "planting",
      text_en: "Marked as planted",
      text_lang: "en",
    });
    if (sysMsgErr) return { error: sysMsgErr.message };
  }
  if (photoKey) {
    const { error: photoMsgErr } = await supabase.from("messages").insert({
      tree_id: treeId,
      from_user_id: profile.user_id,
      from_role: "farmer",
      kind: "photo",
      photo_key: photoKey,
      caption_original: caption,
      caption_en: caption,
    });
    if (photoMsgErr) return { error: photoMsgErr.message };
  } else if (caption) {
    // Caption-only update — post it as a text message so the donor sees the
    // farmer's words in chat.
    const { error: textMsgErr } = await supabase.from("messages").insert({
      tree_id: treeId,
      from_user_id: profile.user_id,
      from_role: "farmer",
      kind: "text",
      text_original: caption,
      text_en: caption,
      text_lang: "en",
    });
    if (textMsgErr) return { error: textMsgErr.message };
  }

  revalidatePath("/farmer");
  revalidatePath("/donor");
  revalidatePath("/admin");

  return { error: null, ok: true };
}
