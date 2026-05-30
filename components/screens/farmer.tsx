"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chip, Placeholder, Stamp } from "@/components/shared";
import { MessageThread, ThreadPreview } from "@/components/messaging";
import type { Farmer as FarmerType, FarmerTree } from "@/lib/data";
import type { FarmerWorkspace } from "@/lib/db/persona-queries";
import { compressImage } from "@/lib/image-compress";
import { postTreeUpdate } from "@/app/trees/actions";

type Tab = "trees" | "messages" | "earnings";

export function Farmer({ workspace }: { workspace: FarmerWorkspace }) {
  const farmer = workspace.farmer;
  const district = workspace.district;
  const v = workspace;
  const [tab, setTab] = useState<Tab>("trees");
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const myThreads = workspace.threadPreviews;
  const selectedPreview = selectedThreadId
    ? myThreads.find((p) => p.treeId === selectedThreadId)
    : null;

  if (selectedTreeId) {
    const tree = v.trees.find((t) => t.id === selectedTreeId);
    if (tree) {
      return (
        <TreeUpdate
          tree={tree}
          farmer={farmer}
          onBack={() => setSelectedTreeId(null)}
        />
      );
    }
  }

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 32,
          alignItems: "end",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Placeholder
              label={farmer.name.split(" ")[0]}
              tone="terra"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                flexShrink: 0,
              }}
              aspect={null}
            />
            <div>
              <div className="eyebrow">
                {farmer.village} · {district.name}
              </div>
              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.05,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                <em>{farmer.name.split(" ")[0]}-ji&apos;s</em> workspace
              </h1>
            </div>
          </div>
          <p
            style={{
              color: "var(--ink-2)",
              maxWidth: 560,
              fontSize: 15,
              marginTop: 14,
            }}
          >
            {v.newMessages} new messages from your donors.{" "}
            {v.trees.filter((t) => t.needsUpdate).length} trees are waiting for a
            photo update. Dry season ends in 17 days — keep an eye on the year-2
            saplings.
          </p>
        </div>

        <div className="card frame" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <div className="eyebrow">This month&apos;s earnings</div>
            <Chip>via UPI</Chip>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 44,
                lineHeight: 1,
              }}
            >
              ₹
              {v.earnings.reduce((s, e) => s + e.amount, 0).toLocaleString(
                "en-IN",
              )}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              received
            </div>
          </div>
          <hr className="dotted-rule" style={{ margin: "14px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {v.earnings.length} donor payments
            </div>
            <button
              className="btn ghost sm"
              onClick={() => setTab("earnings")}
            >
              View ledger →
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row between" style={{ marginBottom: 18 }}>
        <div className="segment">
          <button
            onClick={() => setTab("trees")}
            className={tab === "trees" ? "active" : ""}
          >
            My trees ({v.trees.length})
          </button>
          <button
            onClick={() => setTab("messages")}
            className={tab === "messages" ? "active" : ""}
          >
            Messages ({myThreads.length})
            {v.newMessages > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "var(--terra)",
                  color: "var(--paper)",
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 999,
                }}
              >
                {v.newMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("earnings")}
            className={tab === "earnings" ? "active" : ""}
          >
            Earnings
          </button>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          last sync · just now
        </span>
      </div>

      {/* TREES TAB */}
      {tab === "trees" && (
        <div>
          <div className="grid-3" style={{ gap: 16 }}>
            {v.trees.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTreeId(t.id)}
                className="card frame"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 18,
                  position: "relative",
                  opacity: t.awaitingPlant ? 0.92 : 1,
                }}
              >
                {t.needsUpdate && (
                  <div style={{ position: "absolute", top: -10, right: 14 }}>
                    <Stamp
                      color="var(--terra)"
                      rotation={3}
                      style={{ fontSize: 9 }}
                    >
                      needs update
                    </Stamp>
                  </div>
                )}
                {t.unread > 0 && (
                  <div style={{ position: "absolute", top: -10, left: 14 }}>
                    <span
                      style={{
                        background: "var(--terra)",
                        color: "var(--paper)",
                        padding: "3px 9px",
                        borderRadius: 999,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.unread} new msg
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {t.id}
                  </div>
                  {t.awaitingPlant ? (
                    <Chip tone="terra">awaiting plant</Chip>
                  ) : (
                    <Chip>{t.species}</Chip>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    marginTop: 8,
                  }}
                >
                  {t.species}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "var(--ink-2)" }}>
                  for <strong>{t.donor}</strong>
                </div>
                <hr className="dotted-rule" style={{ margin: "12px 0" }} />
                {!t.awaitingPlant ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          color: "var(--ink)",
                        }}
                      >
                        {t.height}m
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        height
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          color: "var(--ink)",
                        }}
                      >
                        {t.health}%
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        health
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: t.needsUpdate ? "var(--terra)" : "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {t.lastUpdate}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--terra)" }}>
                    Plant within 7 days · then post the first photo
                  </div>
                )}
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    className="link"
                    style={{ fontSize: 13, color: "var(--moss)" }}
                  >
                    {t.awaitingPlant ? "Mark as planted →" : "Add update →"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {tab === "messages" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.8fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px dashed var(--line-2)",
                background: "var(--paper-2)",
              }}
            >
              <div className="eyebrow">Inbox · {myThreads.length}</div>
            </div>
            <div>
              {myThreads.map((p) => (
                <ThreadPreview
                  key={p.treeId}
                  thread={p.thread}
                  farmer={farmer}
                  donorName={p.donorName}
                  role="farmer"
                  selected={selectedThreadId === p.treeId}
                  onClick={() => setSelectedThreadId(p.treeId)}
                />
              ))}
            </div>
          </div>

          {selectedPreview ? (
            <MessageThread
              thread={selectedPreview.thread}
              farmer={farmer}
              donorName={selectedPreview.donorName}
              height={620}
              viewerRole="farmer"
            />
          ) : (
            <div
              className="card frame"
              style={{
                padding: 48,
                textAlign: "center",
                color: "var(--muted)",
                height: 620,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginBottom: 10,
                  }}
                >
                  Pick a conversation
                </div>
                <div
                  style={{ fontSize: 14, maxWidth: 320, margin: "0 auto" }}
                >
                  Every donor who sponsors a tree gets a thread with you. Pick
                  one to read or reply.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EARNINGS TAB */}
      {tab === "earnings" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div className="card frame" style={{ padding: 0 }}>
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px dotted var(--line-2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  UPI ledger
                </div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  Every payment from a donor — straight to your bank account
                </div>
              </div>
              <button className="btn ghost sm">Export CSV</button>
            </div>
            <div style={{ padding: "0 22px" }}>
              {v.earnings.map((e, i, arr) => (
                <div
                  key={e.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1.4fr 1fr 1fr 100px",
                    gap: 16,
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px dotted var(--line-2)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--muted)",
                      letterSpacing: "0.04em",
                      width: 60,
                    }}
                  >
                    {e.date}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 17,
                      }}
                    >
                      {e.donor}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {e.tree} · {e.kind}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--moss)",
                    }}
                  >
                    credited
                  </div>
                  <div
                    style={{ fontFamily: "var(--font-display)", fontSize: 20 }}
                  >
                    ₹{e.amount.toLocaleString("en-IN")}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      className="btn ghost sm"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      disabled={!e.tree || e.tree === "—"}
                      onClick={() => {
                        if (!e.tree || e.tree === "—") return;
                        const w = window.open(
                          `/receipts/${e.tree}`,
                          "_blank",
                        );
                        if (w) {
                          w.addEventListener("load", () => {
                            try {
                              w.print();
                            } catch {
                              // popup blocked or closed; user can print manually
                            }
                          });
                        }
                      }}
                    >
                      receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col" style={{ gap: 18 }}>
            <div className="card frame" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Your UPI
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  padding: "12px 14px",
                  background: "var(--paper-2)",
                  borderRadius: 8,
                  border: "1px dashed var(--line-2)",
                }}
              >
                {farmer.upi}
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                }}
              >
                This is what donors see on your profile. Money lands directly in
                your bank linked to this UPI. PlantTree never sees a rupee of
                it.
              </p>
              <button className="btn ghost sm" style={{ marginTop: 10 }}>
                Update UPI
              </button>
            </div>

            <div className="card frame" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Care holdback
              </div>
              <p
                style={{
                  marginTop: 0,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                }}
              >
                For &quot;plant + care&quot; tier, ₹1,200 is released on planting
                and the balance ₹300 is held until the first 3-month photo
                update. This protects donors and keeps care honest.
              </p>
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "var(--paper-2)",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12 }}>Holdback released so far</span>
                <span
                  style={{ fontFamily: "var(--font-display)", fontSize: 18 }}
                >
                  ₹0
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: 18, background: "var(--paper-2)" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Need help?
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                }}
              >
                If a payment didn&apos;t reach your bank, message the donor in
                their thread first. If still unresolved, tap the help button —
                we&apos;ll step in.
              </p>
              <button className="btn ghost sm" style={{ marginTop: 12 }}>
                Open a help thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- Per-tree update form for the farmer -----
function TreeUpdate({
  tree,
  farmer,
  onBack,
}: {
  tree: FarmerTree;
  farmer: FarmerType;
  onBack: () => void;
}) {
  const router = useRouter();
  const [height, setHeight] = useState<number>(tree.height || 0);
  const [health, setHealth] = useState<number>(
    tree.health === null ? 100 : tree.health,
  );
  const [note, setNote] = useState("");
  const [markPlanted, setMarkPlanted] = useState(!!tree.awaitingPlant);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickPhoto(file: File | null) {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  function submit() {
    if (isPending) return;
    setPostError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("tree_id", tree.id);
      if (note.trim()) fd.set("caption", note.trim());
      if (height > 0) fd.set("height_m", String(height));
      if (health > 0) fd.set("health_pct", String(health));
      if (markPlanted && tree.awaitingPlant) fd.set("mark_planted", "on");

      if (photoFile) {
        try {
          const compressed = await compressImage(photoFile);
          fd.set("photo", compressed.blob, "tree-photo.jpg");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setPostError(`Couldn't process photo: ${msg}`);
          return;
        }
      }

      const result = await postTreeUpdate({ error: null }, fd);
      if (result.error) {
        setPostError(result.error);
        return;
      }
      setPosted(true);
      router.refresh();
      // Tiny pause so the operator gets visual feedback before bouncing back.
      setTimeout(() => onBack(), 900);
    });
  }

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <button
        className="btn ghost sm"
        onClick={onBack}
        style={{ marginBottom: 22 }}
      >
        ← Back to my trees
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="card frame" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <div className="eyebrow">
                {tree.id} · for {tree.donor}
              </div>
              <Chip>{tree.species}</Chip>
            </div>
            <h2 style={{ marginTop: 4 }}>Update your tree</h2>
            <p style={{ color: "var(--ink-2)", marginTop: 8 }}>
              Anything you add here goes straight to {tree.donor}&apos;s tree
              page and into your chat with them. Honest is better than perfect —
              if the tree didn&apos;t grow this month, say so.
            </p>

            {tree.photos && tree.photos.length > 0 && (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  background: "var(--paper-2)",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                }}
              >
                <div
                  className="eyebrow"
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span>
                    Your updates so far · {tree.photos.length}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.06em",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    newest first
                  </span>
                </div>
                <div
                  className="scroll-pretty"
                  style={{
                    display: "flex",
                    gap: 10,
                    overflowX: "auto",
                    paddingBottom: 8,
                  }}
                >
                  {tree.photos.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        flexShrink: 0,
                        width: 130,
                      }}
                    >
                      {p.photoUrl ? (
                        <a
                          href={p.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.photoUrl}
                            alt={p.caption || p.date}
                            style={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid var(--line)",
                              display: "block",
                            }}
                          />
                        </a>
                      ) : (
                        <div
                          className="placeholder-img moss"
                          style={{ aspectRatio: "1/1", borderRadius: 8 }}
                        >
                          <span className="label">no photo</span>
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
                        }}
                      >
                        {p.date}
                      </div>
                      {p.caption && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: "var(--ink-2)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tree.awaitingPlant && (
              <div
                style={{
                  marginTop: 16,
                  padding: 18,
                  background:
                    "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))",
                  borderRadius: 10,
                  borderLeft: "3px solid var(--terra)",
                }}
              >
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  First step
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginBottom: 12,
                  }}
                >
                  Plant the sapling, take a photo, then mark below.
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={markPlanted}
                    onChange={(e) => setMarkPlanted(e.target.checked)}
                    style={{
                      accentColor: "oklch(0.42 0.085 145)",
                      width: 20,
                      height: 20,
                    }}
                  />
                  <span>
                    I&apos;ve planted this sapling. The wooden tag with #{tree.id}{" "}
                    is staked next to it.
                  </span>
                </label>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Add a photo{" "}
                {tree.awaitingPlant
                  ? "of the planted sapling"
                  : "of how it's doing"}
                {markPlanted && tree.awaitingPlant && (
                  <span style={{ color: "var(--terra)" }}> · required</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
                style={{ display: "none" }}
              />
              {photoPreviewUrl ? (
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreviewUrl}
                    alt="Tree photo preview"
                    style={{
                      width: "100%",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid var(--moss)",
                      display: "block",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      pickPhoto(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "var(--paper)",
                      border: "1px solid var(--terra)",
                      color: "var(--terra)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    remove ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="placeholder-img"
                  style={{
                    aspectRatio: "16/10",
                    borderRadius: 10,
                    position: "relative",
                    width: "100%",
                    border: "1px dashed var(--line-2)",
                    background: "var(--paper-2)",
                    cursor: "pointer",
                  }}
                >
                  <span className="label">📷 tap to take or pick a photo</span>
                </button>
              )}
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                tip · include the wooden tag with the tree number in frame
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <label>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Height (metres)
                </div>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                />
              </label>
              <label>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Health (1–100)
                </div>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  value={health}
                  onChange={(e) => setHealth(parseInt(e.target.value) || 0)}
                />
              </label>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Note for {tree.donor.split(" ")[0]}
              </div>
              <textarea
                className="input"
                rows={3}
                placeholder="Aaj subah baarish hui — paudha doob ke piya. Sab theek hai."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                }}
              >
                Hindi is fine. We translate for the donor automatically.
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <button
                className="btn moss"
                onClick={submit}
                disabled={isPending || posted}
                style={{
                  opacity: isPending ? 0.6 : 1,
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {posted
                  ? "✓ Posted"
                  : isPending
                    ? "Posting…"
                    : `Post to ${tree.donor.split(" ")[0]}'s tree page`}
              </button>
            </div>

            {postError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background:
                    "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))",
                  border: "1px solid var(--terra)",
                  borderRadius: 8,
                  color: "var(--terra)",
                  fontSize: 13,
                }}
              >
                {postError}
              </div>
            )}
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="card frame" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Donor preview
            </div>
            <p style={{ marginTop: 0, fontSize: 13, color: "var(--ink-2)" }}>
              What {tree.donor.split(" ")[0]} sees after you post:
            </p>
            <div
              style={{
                background: "var(--paper-2)",
                padding: 14,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              {photoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreviewUrl}
                  alt="Photo preview"
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    borderRadius: 8,
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className="placeholder-img moss"
                  style={{ aspectRatio: "4/3", borderRadius: 8 }}
                >
                  <span className="label">your photo</span>
                </div>
              )}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span>posted by {farmer.name.split(" ")[0]}-ji</span>
                <span>height {height}m</span>
              </div>
              {note && (
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: "var(--ink-2)",
                    lineHeight: 1.45,
                  }}
                >
                  &quot;{note}&quot;
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: "var(--paper-2)" }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              How honest = good
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.55,
              }}
            >
              Donors stay because they trust you. If a tree died, say so — it
              builds the trust faster than any beautiful photo. Replants are
              free under the care plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
