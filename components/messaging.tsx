"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { Placeholder, Chip } from "./shared";
import type { Farmer, Message, Thread } from "@/lib/data";
import { sendMessage, sendPhotoMessage } from "@/app/messages/actions";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

// tree-photos is a public bucket, so we can build the URL straight from the
// project URL + key without a round-trip to sign. This matters for realtime
// arrivals where we can't (cheaply) call the server to sign every event.
function publicTreePhotoUrl(key: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  return `${base}/storage/v1/object/public/tree-photos/${key}`;
}

// Format a UTC timestamp the same way the server-side persona-queries do, so
// realtime arrivals look identical to messages that came from the DB on load.
function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

// Map a postgres_changes INSERT payload (snake_case DB row) to our in-memory
// Message shape. payment-proof rows carry photo_key but no signed URL — the
// donor will see the bubble immediately and the image populates on next page
// load when persona-queries signs the URL. Live signing here would require an
// extra round-trip for every realtime event.
function payloadRowToMessage(row: Record<string, unknown>): Message {
  const kind = row.kind as Message["kind"];
  const photoKey = row.photo_key as string | null;
  // For public-bucket photo messages we can construct the URL inline.
  // payment-proof messages live in a private bucket — leave photoUrl undefined
  // and let the next page load surface the signed URL via persona-queries.
  const photoUrl =
    kind === "photo" && photoKey ? publicTreePhotoUrl(photoKey) : undefined;
  return {
    id: String(row.id),
    from: row.from_role as Message["from"],
    time: formatMsgTime(String(row.created_at)),
    kind,
    text:
      (row.text_en as string | null) ??
      (row.text_original as string | null) ??
      undefined,
    caption:
      (row.caption_en as string | null) ??
      (row.caption_original as string | null) ??
      undefined,
    photoTone: (row.photo_tone as Message["photoTone"]) ?? undefined,
    photoUrl,
  };
}

// ---------- MessageBubble ----------
export function MessageBubble({
  msg,
  farmerName,
  donorName,
}: {
  msg: Message;
  farmerName: string;
  donorName: string;
}) {
  const isDonor = msg.from === "donor";
  const isSystem = msg.from === "system";

  if (isSystem) {
    const icon =
      msg.kind === "planting"
        ? "🌱"
        : msg.kind === "milestone"
          ? "✦"
          : msg.kind === "thread-open"
            ? "→"
            : "•";
    const color =
      msg.kind === "milestone"
        ? "var(--terra)"
        : msg.kind === "planting"
          ? "var(--moss)"
          : "var(--muted)";
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            border: "1px dashed var(--line-2)",
            borderRadius: 999,
            background: "var(--paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color,
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ fontSize: 12 }}>{icon}</span>
          <span>{msg.text}</span>
          <span style={{ color: "var(--muted)", opacity: 0.6 }}>· {msg.time}</span>
        </div>
      </div>
    );
  }

  const align = isDonor ? "flex-end" : "flex-start";
  const isPaymentProof = msg.kind === "payment-proof";
  const bg = isPaymentProof
    ? "var(--paper)"
    : isDonor
      ? "color-mix(in oklch, var(--moss-soft) 60%, var(--paper))"
      : "var(--paper)";
  const border = isPaymentProof
    ? "1px solid var(--terra)"
    : isDonor
      ? "1px solid color-mix(in oklch, var(--moss) 35%, var(--paper))"
      : "1px solid var(--line)";
  const author = isDonor ? donorName : farmerName + "-ji";
  const hasImage = msg.kind === "photo" || isPaymentProof;
  const bubblePadding = hasImage ? 6 : "10px 14px";

  return (
    <div style={{ display: "flex", justifyContent: align, marginBottom: 10 }}>
      <div
        style={{
          maxWidth: "76%",
          display: "flex",
          flexDirection: "column",
          alignItems: align,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 4,
            padding: "0 4px",
          }}
        >
          {isPaymentProof && (
            <span style={{ color: "var(--terra)" }}>
              payment proof ·{" "}
            </span>
          )}
          {author} · {msg.time}
        </div>
        <div
          style={{
            background: bg,
            border,
            borderRadius: 14,
            borderTopRightRadius: isDonor ? 4 : 14,
            borderTopLeftRadius: isDonor ? 14 : 4,
            padding: bubblePadding,
            fontSize: 14,
            lineHeight: 1.45,
            color: "var(--ink)",
          }}
        >
          {hasImage &&
            (msg.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <a
                href={msg.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.photoUrl}
                  alt={msg.caption ?? "Attached photo"}
                  style={{
                    width: 280,
                    maxWidth: "100%",
                    borderRadius: 10,
                    display: "block",
                  }}
                />
              </a>
            ) : (
              <Placeholder
                label={isPaymentProof ? "payment proof" : msg.caption ? "photo" : "image"}
                tone={msg.photoTone === "neutral" ? "neutral" : msg.photoTone || "moss"}
                aspect="4/3"
                style={{ width: 280, maxWidth: "100%", borderRadius: 10 }}
              />
            ))}
          {msg.caption && (
            <div
              style={{
                padding: "8px 8px 4px",
                fontStyle: "italic",
                color: "var(--ink-2)",
                fontSize: 13,
              }}
            >
              {msg.caption}
            </div>
          )}
          {msg.text && !hasImage && <div>{msg.text}</div>}
          {msg.text && hasImage && (
            <div style={{ padding: "0 8px 6px", fontSize: 13 }}>{msg.text}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- MessageThread ----------
export interface MessageThreadProps {
  thread: Thread;
  farmer: Farmer;
  donorName?: string;
  height?: number;
  hasComposer?: boolean;
  headerless?: boolean;
  // When set, send() persists the message via the server action under this
  // role. When omitted, the composer is local-only (used by the picker's
  // success screen before the tree row exists).
  viewerRole?: "donor" | "farmer";
}

export function MessageThread({
  thread,
  farmer,
  donorName = "You",
  height = 520,
  hasComposer = true,
  headerless,
  viewerRole,
}: MessageThreadProps) {
  const [text, setText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(thread.messages);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If a fresh thread arrives from the server (revalidate, page nav), reset
  // local state so we don't keep stale optimistic entries that were already
  // persisted and re-fetched.
  useEffect(() => {
    setLocalMessages(thread.messages);
  }, [thread.messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages.length]);

  // Realtime: subscribe to INSERTs on messages for this tree. RLS still
  // applies — donors get events only for their own trees, farmers only for
  // theirs. The picker's pre-auth success screen passes no viewerRole, so we
  // skip realtime there (there's no real tree to listen to anyway).
  //
  // We explicitly call realtime.setAuth() with the user's access token before
  // subscribing — @supabase/ssr stores the session in cookies but does not
  // always propagate that token to the Realtime socket, which causes RLS to
  // evaluate as anon and silently drop every event.
  useEffect(() => {
    if (!viewerRole || !thread.treeId) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`tree-messages:${thread.treeId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `tree_id=eq.${thread.treeId}`,
          },
          (payload) => {
            const incoming = payloadRowToMessage(
              payload.new as Record<string, unknown>,
            );
            setLocalMessages((prev) => {
              // Skip if we already have this server id (page-load dupe or
              // double-fire from a reconnect).
              if (prev.some((m) => m.id === incoming.id)) return prev;
              // Drop the matching optimistic placeholder, if any: same
              // author, same text, still pending an id swap. Identifying by
              // exact text match keeps the logic dumb and works because the
              // user can't send two identical messages in a few hundred ms.
              const withoutOptimistic = prev.filter((m) => {
                if (!m.id.startsWith("local-")) return true;
                if (m.from !== incoming.from) return true;
                if (m.text !== incoming.text) return true;
                return false;
              });
              return [...withoutOptimistic, incoming];
            });
          },
        )
        .subscribe((status, err) => {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.log(
              `[realtime] tree-messages:${thread.treeId} → ${status}`,
              err ?? "",
            );
          }
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [thread.treeId, viewerRole]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const optimisticId = "local-" + Date.now();
    const fromRole: "donor" | "farmer" = viewerRole ?? "donor";
    setLocalMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        from: fromRole,
        time: "just now",
        kind: "text",
        text: trimmed,
      },
    ]);
    setText("");
    setSendError(null);

    if (!viewerRole) return; // local-only mode (e.g. picker success screen)

    startTransition(async () => {
      const fd = new FormData();
      fd.set("tree_id", thread.treeId);
      fd.set("text", trimmed);
      const result = await sendMessage({ error: null }, fd);
      if (result.error) {
        setSendError(result.error);
        // Roll back the optimistic message so the donor/farmer can retry.
        setLocalMessages((prev) =>
          prev.filter((m) => m.id !== optimisticId),
        );
        setText(trimmed); // restore the draft
      }
    });
  }

  async function handlePhotoPick(file: File | null) {
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!viewerRole || !thread.treeId) return;

    setSendError(null);
    setIsUploadingPhoto(true);

    let compressed: Blob;
    try {
      compressed = (await compressImage(file)).blob;
    } catch (e) {
      setIsUploadingPhoto(false);
      const msg = e instanceof Error ? e.message : String(e);
      setSendError(`Couldn't process photo: ${msg}`);
      return;
    }

    const optimisticId = "local-" + Date.now();
    const previewUrl = URL.createObjectURL(file);
    setLocalMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        from: viewerRole,
        time: "just now",
        kind: "photo",
        photoUrl: previewUrl,
      },
    ]);

    const fd = new FormData();
    fd.set("tree_id", thread.treeId);
    fd.set("photo", compressed, "photo.jpg");
    const result = await sendPhotoMessage({ error: null }, fd);
    setIsUploadingPhoto(false);

    if (result.error) {
      setSendError(result.error);
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      URL.revokeObjectURL(previewUrl);
      return;
    }

    // Swap optimistic placeholder with the persisted row so the realtime echo
    // de-dupes by id-match.
    if (result.message) {
      const real = result.message;
      setLocalMessages((prev) =>
        prev.map((m) => {
          if (m.id !== optimisticId) return m;
          URL.revokeObjectURL(previewUrl);
          return { ...m, id: real.id, photoUrl: real.photoUrl };
        }),
      );
    }
  }

  return (
    <div
      className="card frame"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height,
      }}
    >
      {!headerless && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px dashed var(--line-2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--paper-2)",
          }}
        >
          <Placeholder
            label={farmer.name.split(" ")[0]}
            tone="terra"
            style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }}
            aspect={null}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
              {farmer.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              {farmer.village} · tree #{thread.treeId}
            </div>
          </div>
          <Chip>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--moss)",
                display: "inline-block",
                marginRight: 6,
              }}
            ></span>
            active
          </Chip>
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 22px",
          background: "var(--paper)",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.012) 0, transparent 50%)",
        }}
      >
        {localMessages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            farmerName={farmer.name.split(" ")[0]}
            donorName={donorName}
          />
        ))}
      </div>

      {hasComposer && (
        <div
          style={{
            borderTop: "1px dashed var(--line-2)",
            background: "var(--paper-2)",
            padding: 12,
          }}
        >
          {viewerRole === "farmer" && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoPick(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {viewerRole === "farmer" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  cursor: isUploadingPhoto ? "not-allowed" : "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  opacity: isUploadingPhoto ? 0.5 : 1,
                }}
                title="Attach photo"
              >
                📷
              </button>
            )}
            <input
              className="input"
              placeholder={`Message ${farmer.name.split(" ")[0]}-ji…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={isPending}
              style={{ flex: 1 }}
            />
            <button
              className="btn moss sm"
              onClick={send}
              style={{ padding: "10px 16px" }}
              disabled={!text.trim() || isPending}
            >
              {isPending ? "Sending…" : "Send"}
            </button>
          </div>
          {isUploadingPhoto && (
            <div
              style={{
                marginTop: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--moss)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              uploading photo…
            </div>
          )}
          {sendError && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 10px",
                fontSize: 12,
                color: "var(--terra)",
                background:
                  "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))",
                border: "1px solid var(--terra)",
                borderRadius: 6,
              }}
            >
              {sendError}
            </div>
          )}
          <div
            style={{
              marginTop: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            messages live on PlantTree · not WhatsApp · not your phone number
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ThreadPreview ----------
export interface ThreadPreviewProps {
  thread: Thread;
  farmer: Farmer;
  donorName?: string;
  selected?: boolean;
  onClick?: () => void;
  role?: "donor" | "farmer";
}

export function ThreadPreview({
  thread,
  farmer,
  selected,
  onClick,
  role = "donor",
}: ThreadPreviewProps) {
  const last = thread.messages[thread.messages.length - 1];
  const lastText =
    last.kind === "photo"
      ? "📷 Photo"
      : last.kind === "payment-proof"
        ? "💳 Payment proof"
        : last.text;
  const counterpart = role === "donor" ? farmer.name : thread.donor;
  const counterpartSub = role === "donor" ? farmer.village : `tree #${thread.treeId}`;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "14px 16px",
        background: selected
          ? "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))"
          : "var(--paper)",
        border: 0,
        borderBottom: "1px dotted var(--line-2)",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <Placeholder
        label={counterpart.split(" ")[0]}
        tone="terra"
        style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }}
        aspect={null}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
            {counterpart}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--muted)",
              letterSpacing: "0.04em",
            }}
          >
            {last.time}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          {counterpartSub}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 2,
          }}
        >
          {last.from === "system" ? <em>{lastText}</em> : lastText}
        </div>
      </div>
    </button>
  );
}
