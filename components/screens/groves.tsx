"use client";

// Public grove registry — visitor-facing. Browse donors who made their grove
// public, open one to see their trees (growth only — no contact details,
// receipts, or messages).

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Placeholder, TreeViz } from "@/components/shared";
import type { PublicGrove } from "@/lib/db/groves-queries";

export function PublicGroves({ groves }: { groves: PublicGrove[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId) {
    const g = groves.find((x) => x.id === openId);
    if (g) {
      return <PublicGroveDetail grove={g} onBack={() => setOpenId(null)} />;
    }
  }

  const totalTrees = groves.reduce((s, g) => s + g.trees, 0);

  return (
    <div className="shell" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <button
        className="btn ghost sm"
        onClick={() => router.push("/")}
        style={{ marginBottom: 18 }}
      >
        ← Home
      </button>
      <div style={{ maxWidth: 620, marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Public groves · {groves.length}{" "}
          {groves.length === 1 ? "donor" : "donors"}
        </div>
        <h1 style={{ marginBottom: 14 }}>
          People growing <em>forests</em>, one tree at a time.
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 17, lineHeight: 1.55 }}>
          These donors chose to make their grove public. Open any one to see the
          trees they&apos;ve paid for — where they live and how they&apos;re
          growing. {totalTrees} trees between them, and counting.
        </p>
      </div>

      {groves.length === 0 ? (
        <div
          className="card frame"
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: "var(--muted)",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 20,
          }}
        >
          No public groves yet. Be the first — plant a tree, then make your grove
          public from your settings.
        </div>
      ) : (
        <div className="grid-3">
          {groves.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setOpenId(g.id)}
              className="card frame"
              style={{
                textAlign: "left",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: "18px 18px 0",
                }}
              >
                <Placeholder
                  label={g.name.split(" ")[0]}
                  tone={i % 2 === 0 ? "moss" : "terra"}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                  aspect={null}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
                  >
                    {g.name}
                    {g.isYou && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--moss)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginLeft: 8,
                        }}
                      >
                        you
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    since {g.joined}
                  </div>
                </div>
              </div>
              <p
                style={{
                  padding: "12px 18px 0",
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 16,
                  color: "var(--ink-2)",
                  lineHeight: 1.4,
                }}
              >
                &quot;{g.blurb}&quot;
              </p>
              <div
                style={{
                  marginTop: 14,
                  padding: "14px 18px",
                  borderTop: "1px dotted var(--line-2)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <span>{g.trees} trees</span>
                <span>{g.districts} districts</span>
                <span style={{ color: "var(--moss)" }}>open →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PublicGroveDetail({
  grove,
  onBack,
}: {
  grove: PublicGrove;
  onBack: () => void;
}) {
  const router = useRouter();
  const stages = ["seed", "sprout", "sapling", "young", "mature"];

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: 22 }}>
        ← All public groves
      </button>

      <div
        style={{
          display: "flex",
          gap: 18,
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <Placeholder
          label={grove.name.split(" ")[0]}
          tone="moss"
          style={{ width: 76, height: 76, borderRadius: "50%", flexShrink: 0 }}
          aspect={null}
        />
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Public grove · since {grove.joined}
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.05 }}>
            {grove.name}&apos;s <em>grove</em>
          </h1>
        </div>
      </div>
      <p
        style={{
          color: "var(--ink-2)",
          fontSize: 17,
          fontStyle: "italic",
          fontFamily: "var(--font-display)",
          maxWidth: 560,
          marginBottom: 14,
        }}
      >
        &quot;{grove.blurb}&quot;
      </p>
      <div
        style={{
          display: "flex",
          gap: 22,
          marginBottom: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>
          <strong
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              color: "var(--ink)",
            }}
          >
            {grove.trees}
          </strong>{" "}
          trees
        </span>
        <span>
          <strong
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              color: "var(--ink)",
            }}
          >
            {grove.districts}
          </strong>{" "}
          districts
        </span>
      </div>

      <div
        style={{
          padding: "10px 14px",
          background: "var(--paper-2)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.03em",
          marginBottom: 22,
        }}
      >
        Public view · trees &amp; growth only. Contact details, receipts and
        messages stay private.
      </div>

      <div className="grid-2">
        {grove.treeList.map((t) => (
          <div
            key={t.id}
            className="card frame"
            style={{ padding: 0, overflow: "hidden" }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: 22 }}>
                <div className="eyebrow">
                  {t.id} · {t.districtName}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
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
                <div style={{ display: "flex", gap: 18 }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      height
                    </div>
                    <div
                      style={{ fontFamily: "var(--font-display)", fontSize: 20 }}
                    >
                      {t.height}m
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      stage
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 20,
                        textTransform: "capitalize",
                      }}
                    >
                      {stages[t.stage]}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                  }}
                >
                  tended by {t.farmerFirstName}-ji
                </div>
              </div>
              <div
                style={{
                  width: 140,
                  flexShrink: 0,
                  borderLeft: "1px dashed var(--line-2)",
                }}
              >
                <TreeViz stage={t.stage} height="100%" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <button className="btn moss" onClick={() => router.push("/")}>
          Start your own grove <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}
