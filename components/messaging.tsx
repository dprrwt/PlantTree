"use client";

import React, { useEffect, useRef, useState } from "react";
import { Placeholder, Chip } from "./shared";
import type { Farmer, Message, Thread } from "@/lib/data";

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
  const bg = isDonor
    ? "color-mix(in oklch, var(--moss-soft) 60%, var(--paper))"
    : "var(--paper)";
  const border = isDonor
    ? "1px solid color-mix(in oklch, var(--moss) 35%, var(--paper))"
    : "1px solid var(--line)";
  const author = isDonor ? donorName : farmerName + "-ji";

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
          {author} · {msg.time}
        </div>
        <div
          style={{
            background: bg,
            border,
            borderRadius: 14,
            borderTopRightRadius: isDonor ? 4 : 14,
            borderTopLeftRadius: isDonor ? 14 : 4,
            padding: msg.kind === "photo" ? 6 : "10px 14px",
            fontSize: 14,
            lineHeight: 1.45,
            color: "var(--ink)",
          }}
        >
          {msg.kind === "photo" && (
            <Placeholder
              label={msg.caption ? "photo" : "image"}
              tone={msg.photoTone === "neutral" ? "neutral" : msg.photoTone || "moss"}
              aspect="4/3"
              style={{ width: 280, maxWidth: "100%", borderRadius: 10 }}
            />
          )}
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
          {msg.text && msg.kind !== "photo" && <div>{msg.text}</div>}
          {msg.text && msg.kind === "photo" && (
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
  onSendScreenshot?: () => void;
  hasComposer?: boolean;
  headerless?: boolean;
}

export function MessageThread({
  thread,
  farmer,
  donorName = "You",
  height = 520,
  onSendScreenshot,
  hasComposer = true,
  headerless,
}: MessageThreadProps) {
  const [text, setText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(thread.messages);
  const [showAttach, setShowAttach] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages.length]);

  function send() {
    if (!text.trim()) return;
    setLocalMessages([
      ...localMessages,
      {
        id: "local-" + Date.now(),
        from: "donor",
        time: "just now",
        kind: "text",
        text: text.trim(),
      },
    ]);
    setText("");
  }

  function attachScreenshot() {
    setLocalMessages([
      ...localMessages,
      {
        id: "local-" + Date.now(),
        from: "donor",
        time: "just now",
        kind: "photo",
        caption: "Payment screenshot",
        photoTone: "neutral",
      },
    ]);
    setShowAttach(false);
    if (onSendScreenshot) onSendScreenshot();
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
          {showAttach && (
            <div
              style={{
                padding: 10,
                marginBottom: 10,
                background: "var(--paper)",
                border: "1px dashed var(--moss)",
                borderRadius: 10,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Attach
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn ghost sm" onClick={attachScreenshot}>
                  📷 Payment screenshot
                </button>
                <button className="btn ghost sm">🌱 Photo</button>
                <button
                  className="btn ghost sm"
                  onClick={() => setShowAttach(false)}
                >
                  cancel
                </button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setShowAttach(!showAttach)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: showAttach ? "var(--moss)" : "var(--paper)",
                color: showAttach ? "var(--paper)" : "var(--ink)",
                border: `1px solid ${showAttach ? "var(--moss)" : "var(--line)"}`,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
              title="Attach"
            >
              +
            </button>
            <input
              className="input"
              placeholder={`Message ${farmer.name.split(" ")[0]}-ji…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              style={{ flex: 1 }}
            />
            <button
              className="btn moss sm"
              onClick={send}
              style={{ padding: "10px 16px" }}
              disabled={!text.trim()}
            >
              Send
            </button>
          </div>
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
      : last.kind === "milestone" ||
          last.kind === "planting" ||
          last.kind === "thread-open"
        ? last.text
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
