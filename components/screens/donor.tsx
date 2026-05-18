"use client";

import React, { useState } from "react";
import {
  Chip,
  Ornament,
  Placeholder,
  Stamp,
  TreeViz,
  UttarakhandMap,
} from "@/components/shared";
import { MessageBubble, MessageThread } from "@/components/messaging";
import { DISTRICTS, FARMERS, THREADS, USER_GROVE, type Tree } from "@/lib/data";
import type { Screen } from "./types";

export function Donor({ navigate }: { navigate: (s: Screen) => void }) {
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const grove = USER_GROVE;

  if (selectedTreeId) {
    const tree = grove.trees.find((t) => t.id === selectedTreeId);
    if (tree) {
      return (
        <TreeDetail
          tree={tree}
          onBack={() => setSelectedTreeId(null)}
        />
      );
    }
  }

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 32,
          alignItems: "end",
          marginBottom: 32,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Member since {grove.joined}
          </div>
          <h1 style={{ marginBottom: 14 }}>
            {grove.name}&apos;s <em>trees</em>
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              marginTop: 0,
              maxWidth: 540,
              fontSize: 16,
            }}
          >
            Three trees across three Uttarakhand districts. One was planted
            last week — photo just came in.
          </p>
        </div>
        <div
          className="card"
          style={{
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 18,
            padding: 22,
          }}
        >
          <div>
            <div className="stat-num">{grove.total}</div>
            <div className="stat-label">trees</div>
          </div>
          <div>
            <div className="stat-num">₹{grove.totalPaid.toLocaleString("en-IN")}</div>
            <div className="stat-label">to farmers</div>
          </div>
          <div>
            <div className="stat-num">3</div>
            <div className="stat-label">districts</div>
          </div>
        </div>
      </div>

      <div className="row between" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="segment">
            <button className="active">All trees</button>
            <button>By farmer</button>
            <button>By district</button>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {grove.trees.length} entries
          </span>
        </div>
        <button className="btn moss sm" onClick={() => navigate("browse")}>
          Plant another <span className="arrow">→</span>
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 48 }}>
        {grove.trees.map((t) => {
          const district = DISTRICTS.find((d) => d.id === t.districtId);
          const farmer = FARMERS.find((f) => f.id === t.farmerId);
          const stages = ["seed", "sprout", "sapling", "young", "mature"];
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTreeId(t.id)}
              className="card frame"
              style={{
                textAlign: "left",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex" }}>
                <div style={{ flex: 1, padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div className="eyebrow">
                      {t.id} · {district?.name}
                    </div>
                    <div className="badge-stage">{stages[t.stage]}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 26,
                      marginTop: 6,
                    }}
                  >
                    {t.species}
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 12,
                      fontStyle: "italic",
                      marginBottom: 14,
                    }}
                  >
                    {t.sci}
                  </div>

                  <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
                    {[
                      ["height", `${t.height}m`],
                      ["health", `${t.health}%`],
                      ["you paid", `₹${t.paid}`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--muted)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 20,
                          }}
                        >
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
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
                      {farmer?.name.split(" ")[0]}-ji · {t.lastUpdate}
                    </div>
                    <span className="link" style={{ fontSize: 13 }}>
                      open →
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: 150,
                    flexShrink: 0,
                    borderLeft: "1px dashed var(--line-2)",
                  }}
                >
                  <TreeViz stage={t.stage} height="100%" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Ornament label="Latest from your farmers" />
      <div style={{ height: 24 }}></div>
      <div className="grid-3">
        {[
          {
            who: "Sunita-ji · Almora",
            date: "5 days ago",
            text: "Baarish jaldi aa gayi. Tumhaara banj oak doob ke piya. Bahut accha.",
            en: "The rains came early. Your banj oak drank deep. Very good.",
          },
          {
            who: "Geeta-ji · Tehri",
            date: "1 week ago",
            text: "Akhrot ka paudha lagaa diya. Photo bhej rahe hain thread me.",
            en: "Walnut sapling is in the ground. Sending photo in your thread.",
          },
          {
            who: "Kamla-ji · Bageshwar",
            date: "today",
            text:
              "Buransh ka paudha aaj subah lagaaya. Tumhaare naam ki taakhti laga di hai paas mein.",
            en: "Planted your buransh this morning. Put a wooden tag with your name next to it.",
          },
        ].map((u, i) => (
          <div
            key={i}
            className="card"
            style={{
              background: i === 1 ? "var(--paper-2)" : "var(--paper)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <span>{u.who}</span>
              <span>{u.date}</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              &quot;{u.text}&quot;
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
              — {u.en}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeDetail({ tree, onBack }: { tree: Tree; onBack: () => void }) {
  const district = DISTRICTS.find((d) => d.id === tree.districtId);
  const farmer = FARMERS.find((f) => f.id === tree.farmerId);
  const stages = ["Seed", "Sprout", "Sapling", "Young tree", "Mature"];
  const thread = THREADS[tree.id];
  const [showFullThread, setShowFullThread] = useState(false);

  if (showFullThread && thread && farmer) {
    return (
      <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <button
          className="btn ghost sm"
          onClick={() => setShowFullThread(false)}
          style={{ marginBottom: 22 }}
        >
          ← Back to tree {tree.id}
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <MessageThread
            thread={thread}
            farmer={farmer}
            donorName="You"
            height={640}
          />
          <div className="card frame" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              About this thread
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.55,
              }}
            >
              Messages here go straight to {farmer.name.split(" ")[0]}-ji&apos;s
              PlantTree inbox — not WhatsApp, not their personal phone. They
              reply when they&apos;re back from the field.
            </div>
            <hr className="dotted-rule" style={{ margin: "14px 0" }} />
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Quick actions
            </div>
            <button
              className="btn ghost sm"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                marginBottom: 6,
              }}
            >
              Send a tip via UPI →
            </button>
            <button
              className="btn ghost sm"
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              Visit the plot →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysSincePlanted = Math.floor(
    (new Date().getTime() - new Date(tree.planted).getTime()) / 86400000,
  );

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
          gridTemplateColumns: "1.1fr 1fr",
          gap: 36,
          alignItems: "start",
        }}
      >
        <div>
          <div className="card frame" style={{ padding: 22, position: "relative" }}>
            <div style={{ position: "absolute", top: -14, right: 22 }}>
              <Stamp color="var(--moss)" rotation={3}>
                day {daysSincePlanted}
              </Stamp>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 12,
              }}
            >
              <div>
                <div className="eyebrow">
                  {tree.id} · planted{" "}
                  {new Date(tree.planted).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 40,
                    marginTop: 4,
                  }}
                >
                  {tree.species}
                </div>
                <div style={{ color: "var(--muted)", fontStyle: "italic" }}>
                  {tree.sci} · {district?.name}
                </div>
              </div>
              <div className="badge-stage">{stages[tree.stage]}</div>
            </div>
            <TreeViz stage={tree.stage} height={340} />

            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Growth · year by year
              </div>
              <div
                style={{
                  position: "relative",
                  height: 70,
                  background: "var(--paper-2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                  }}
                >
                  {["Y0", "Y1", "Y2", "Y3", "Y5", "Y10"].map((y) => (
                    <span key={y}>{y}</span>
                  ))}
                </div>
                <svg
                  viewBox="0 0 300 40"
                  preserveAspectRatio="none"
                  width="100%"
                  height="40"
                  style={{ marginTop: 4 }}
                >
                  <path
                    d="M 0 36 Q 50 32, 80 26 Q 120 18, 160 12 Q 220 6, 300 2"
                    fill="none"
                    stroke="oklch(0.42 0.085 145)"
                    strokeWidth="2"
                  />
                  <circle
                    cx={tree.stage * 60}
                    cy={36 - tree.stage * 8}
                    r="4"
                    fill="oklch(0.42 0.085 145)"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    left: `${(tree.stage / 5) * 100}%`,
                    bottom: 12,
                    transform: "translateX(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--moss)",
                    background: "var(--paper)",
                    padding: "1px 6px",
                    borderRadius: 3,
                    border: "1px solid var(--moss)",
                    whiteSpace: "nowrap",
                  }}
                >
                  you are here · {tree.height}m
                </div>
              </div>
            </div>
          </div>

          <div className="card frame" style={{ marginTop: 22, padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="eyebrow">Where it lives</div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    marginTop: 2,
                  }}
                >
                  {farmer?.village}
                </div>
              </div>
              {district && <Chip>{district.elevation}</Chip>}
            </div>
            {district && (
              <UttarakhandMap
                pins={[district]}
                selected={district.id}
                height={260}
                compact
              />
            )}
          </div>
        </div>

        <div className="col" style={{ gap: 22 }}>
          <div className="card frame" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Receipt
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Paid to</span>
                <span>{farmer?.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>UPI ID</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {farmer?.upi}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Amount</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                  ₹{tree.paid.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Paid on</span>
                <span>
                  {new Date(tree.planted).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
            <button className="btn ghost sm" style={{ marginTop: 14 }}>
              Download certificate (PDF) →
            </button>
          </div>

          {farmer && (
            <div className="card frame" style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 14,
                }}
              >
                <div className="eyebrow">Tended by</div>
                {thread && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--moss)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    · {thread.messages.length} messages
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Placeholder
                  label={farmer.name.split(" ")[0]}
                  tone="terra"
                  style={{ width: 64, height: 64, borderRadius: "50%" }}
                  aspect={null}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                    {farmer.name}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {farmer.village} · {farmer.years} yrs
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.45,
                  borderLeft: "2px solid var(--terra)",
                  paddingLeft: 14,
                  color: "var(--ink-2)",
                }}
              >
                &quot;{farmer.quoteEn}&quot;
              </div>
              <button
                className="btn moss sm"
                style={{
                  marginTop: 16,
                  width: "100%",
                  justifyContent: "center",
                }}
                onClick={() => setShowFullThread(true)}
                disabled={!thread}
              >
                {thread
                  ? `Open chat with ${farmer.name.split(" ")[0]}-ji →`
                  : "Chat opens after planting"}
              </button>
            </div>
          )}

          {thread && farmer && (
            <div className="card frame" style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                }}
              >
                <div className="eyebrow">Latest in your thread</div>
                <button
                  className="link"
                  style={{
                    background: "none",
                    border: 0,
                    fontSize: 13,
                    color: "var(--moss)",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowFullThread(true)}
                >
                  open thread →
                </button>
              </div>
              <div
                style={{
                  background: "var(--paper-2)",
                  borderRadius: 10,
                  padding: 12,
                  maxHeight: 220,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {thread.messages.slice(-3).map((m) => (
                  <MessageBubble
                    key={m.id}
                    msg={m}
                    farmerName={farmer.name.split(" ")[0]}
                    donorName="You"
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 36,
                    background:
                      "linear-gradient(transparent, var(--paper-2))",
                  }}
                ></div>
              </div>
            </div>
          )}

          {tree.photos && farmer && (
            <div className="card frame" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Photo updates · posted by {farmer.name.split(" ")[0]}-ji
              </div>
              <div className="hscroll">
                {tree.photos.map((p, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 170 }}>
                    <Placeholder label={p.date} tone="moss" aspect="3/4" />
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "var(--ink-2)",
                      }}
                    >
                      {p.caption}
                    </div>
                    {p.by && (
                      <div
                        style={{
                          marginTop: 4,
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--muted)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        · by {farmer.name.split(" ")[0]}-ji
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tree.milestones && farmer && (
            <div className="card frame" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Milestones
              </div>
              {tree.milestones.map((m, i, a) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "10px 0",
                    borderBottom:
                      i < a.length - 1 ? "1px dotted var(--line-2)" : "none",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${m.done ? "var(--moss)" : "var(--line-2)"}`,
                      background: m.done ? "var(--moss)" : "transparent",
                      flexShrink: 0,
                    }}
                  ></div>
                  <div
                    style={{
                      width: 100,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {m.date}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      color: m.done ? "var(--ink)" : "var(--muted)",
                    }}
                  >
                    {m.label}
                    {m.by && m.done && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--muted)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        · marked by {farmer.name.split(" ")[0]}-ji
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
