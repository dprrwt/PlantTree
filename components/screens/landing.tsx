"use client";

import React from "react";
import {
  Chip,
  Logo,
  Ornament,
  Placeholder,
  Stamp,
  TreeViz,
} from "@/components/shared";
import { DISTRICTS, FARMERS } from "@/lib/data";
import type { Screen } from "./types";

export function Landing({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div>
      {/* HERO */}
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 64 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 26,
                flexWrap: "wrap",
              }}
            >
              <Stamp color="var(--terra)" rotation={-3}>
                active pilot
              </Stamp>
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
                Uttarakhand · India
              </Chip>
              <Chip>5 farmers · 96 trees</Chip>
            </div>
            <h1 style={{ marginBottom: 26 }}>
              Pay a farmer.
              <br />
              Plant a <em className="squiggle">tree</em>.
              <br />
              Watch it root.
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.5,
                color: "var(--ink-2)",
                maxWidth: 540,
                marginBottom: 26,
              }}
            >
              Your money goes <em>directly</em> to a farmer who plants — and tends —
              one specific tree for you, in a place that scientifically needs it.
              You get to watch it grow.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "color-mix(in oklch, var(--moss-soft) 50%, var(--paper))",
                border: "1px dashed var(--moss)",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                color: "var(--ink-2)",
                marginBottom: 28,
              }}
            >
              <span style={{ fontSize: 14 }}>✦</span>
              <span>
                <strong>100% of your money</strong> reaches the farmer. We never
                touch it.
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn moss" onClick={() => navigate("browse")}>
                Choose a farmer <span className="arrow">→</span>
              </button>
              <button className="btn ghost" onClick={() => navigate("donor")}>
                See a donor&apos;s grove
              </button>
            </div>
            <div
              style={{
                marginTop: 36,
                display: "flex",
                gap: 28,
                color: "var(--muted)",
                fontSize: 13,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    color: "var(--ink)",
                  }}
                >
                  100%
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  direct to farmer
                </div>
              </div>
              <div style={{ width: 1, background: "var(--line)" }}></div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    color: "var(--ink)",
                  }}
                >
                  Native
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  species only
                </div>
              </div>
              <div style={{ width: 1, background: "var(--line)" }}></div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    color: "var(--ink)",
                  }}
                >
                  7 days
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  to photo proof
                </div>
              </div>
            </div>
          </div>

          {/* hero illustration: tree growing card */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -18, right: -10, zIndex: 2 }}>
              <Stamp color="var(--moss)" rotation={4}>
                verified planting
              </Stamp>
            </div>
            <div
              className="card frame"
              style={{ padding: 18, transform: "rotate(0.8deg)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  Tree #PT-014 · day 312
                </div>
                <div className="badge-stage">growing</div>
              </div>
              <TreeViz stage={3} height={320} />
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontStyle: "italic",
                    }}
                  >
                    Banj oak
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Tended by Sunita-ji, Almora · 2.4m tall
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--muted)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    survived year
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
                    01
                  </div>
                </div>
              </div>
            </div>
            <div
              className="card"
              style={{
                position: "absolute",
                bottom: -32,
                left: -28,
                zIndex: 3,
                padding: "14px 16px",
                transform: "rotate(-2deg)",
                width: 240,
                background: "var(--paper)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Placeholder
                  label="Sunita"
                  tone="terra"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                  aspect={null}
                />
                <div>
                  <div style={{ fontWeight: 500 }}>Sunita Devi</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Dhauladevi, Almora
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 15,
                  lineHeight: 1.35,
                  color: "var(--ink-2)",
                }}
              >
                &quot;Your oak made it through its first dry season.&quot;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — short teaser */}
      <section className="shell" style={{ paddingTop: 72, paddingBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 24,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Ornament label="How it works" />
          </div>
          <button className="btn ghost sm" onClick={() => navigate("how")}>
            Full walkthrough <span className="arrow">→</span>
          </button>
        </div>
        <div className="grid-3">
          {[
            {
              n: "01",
              t: "Choose a farmer & a place",
              d: "Browse vetted farmers in our current pilot region. Read their story.",
              tone: "moss" as const,
            },
            {
              n: "02",
              t: "Pay them directly",
              d: "Send the amount straight via UPI. Your money never sits in our account.",
              tone: "terra" as const,
            },
            {
              n: "03",
              t: "Track it. See it grow.",
              d: "Photo proof within 7 days. Growth updates for the next 20 years.",
              tone: "moss" as const,
            },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => navigate("how")}
              className="card frame"
              style={{
                position: "relative",
                textAlign: "left",
                cursor: "pointer",
                background: "var(--paper)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: 22,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  background: "var(--paper)",
                  color: "var(--muted)",
                  padding: "2px 8px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  letterSpacing: "0.1em",
                }}
              >
                step {s.n}
              </div>
              <Placeholder label={`illust. ${s.n}`} tone={s.tone} aspect="16/9" />
              <h3 style={{ marginTop: 18, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ color: "var(--ink-2)", margin: 0 }}>{s.d}</p>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--moss)",
                  letterSpacing: "0.06em",
                }}
              >
                read more →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* WHY DIRECT */}
      <section className="shell section">
        <div
          className="card"
          style={{
            background: "var(--paper-2)",
            padding: 0,
            border: "1px solid var(--line-2)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "48px 44px" }}>
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                The direct model
              </div>
              <h2 style={{ marginBottom: 18 }}>
                No middlemen.
                <br />
                <em>One farmer, one tree.</em>
              </h2>
              <p
                style={{
                  color: "var(--ink-2)",
                  maxWidth: 460,
                  marginBottom: 18,
                }}
              >
                Traditional reforestation NGOs lose 20–40% of every donation to
                overhead before a single sapling is bought. We&apos;re not a
                charity — we&apos;re a directory. Your payment goes straight to the
                farmer&apos;s bank account. We make the introduction and verify the
                photo.
              </p>
              <p style={{ color: "var(--ink-2)", maxWidth: 460, fontSize: 14 }}>
                Trade-off, openly: <strong>no tax deduction yet</strong> (that
                needs charity registration we haven&apos;t done). If you want a
                write-off, use a registered NGO. If you want every rupee to
                reach the soil, use us.
              </p>
            </div>
            <div
              style={{
                borderLeft: "1px dashed var(--line-2)",
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                How a typical donation splits
              </div>
              <div
                className="card frame"
                style={{ background: "var(--paper)", padding: 22 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>
                    Traditional NGO
                  </div>
                  <div
                    style={{
                      display: "flex",
                      height: 28,
                      borderRadius: 6,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ background: "var(--moss)", width: "58%" }}></div>
                    <div style={{ background: "var(--terra)", width: "22%" }}></div>
                    <div
                      style={{ background: "oklch(0.55 0.03 70)", width: "20%" }}
                    ></div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    <span>58% farmer</span>
                    <span>22% ops</span>
                    <span>20% fundraising</span>
                  </div>
                </div>
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, color: "var(--moss)" }}
                  >
                    PlantTree.life
                  </div>
                  <div
                    style={{
                      display: "flex",
                      height: 28,
                      borderRadius: 6,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ background: "var(--moss)", width: "100%" }}></div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    <span>100% farmer</span>
                    <span>0% us</span>
                  </div>
                </div>
              </div>
              <div
                style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}
              >
                We&apos;re funded separately — not by skimming yours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT TREE RIGHT PLACE */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              The science-first part
            </div>
            <h2 style={{ marginBottom: 18 }}>
              Right tree.
              <br />
              <em>Right place.</em>
            </h2>
            <p
              style={{
                color: "var(--ink-2)",
                maxWidth: 460,
                marginBottom: 18,
              }}
            >
              Every plot is screened on six measurable axes before a single
              seedling goes in the ground. Only native species. Only community
              land. We share the science with farmers — it&apos;s a playbook, not
              a gate.
            </p>
            <button className="btn ghost sm" onClick={() => navigate("where")}>
              Read the full methodology <span className="arrow">→</span>
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {[
              ["Soil chemistry", "N · P · K · pH"],
              ["Rainfall pattern", "12-mo cycle"],
              ["Existing canopy", "Satellite NDVI"],
              ["Native species fit", "Local nursery stock"],
              ["Community land tenure", "Panchayat verified"],
              ["Water access", "Within 800m"],
            ].map(([t, s]) => (
              <button
                key={t}
                onClick={() => navigate("where")}
                className="card"
                style={{
                  background: "var(--paper-2)",
                  borderLeft: "2px solid var(--moss)",
                  padding: "14px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                  {t}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {s}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WHERE WE PLANT teaser */}
      <section className="shell" style={{ paddingTop: 16, paddingBottom: 80 }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Where we plant · pilot phase
            </div>
            <h2>
              Six districts. <em>One state.</em>
              <br />
              One thing at a time.
            </h2>
            <p
              style={{
                color: "var(--ink-2)",
                maxWidth: 540,
                marginTop: 14,
                fontSize: 15,
              }}
            >
              We&apos;re starting in Uttarakhand —{" "}
              {DISTRICTS.filter((d) => d.status === "active").length} districts
              actively planting,{" "}
              {DISTRICTS.filter((d) => d.status === "field-visited").length}{" "}
              field-visited and preparing,{" "}
              {DISTRICTS.filter((d) => d.status === "researching").length} under
              desk research.
            </p>
          </div>
          <button className="btn ghost sm" onClick={() => navigate("where")}>
            See all districts & the science <span className="arrow">→</span>
          </button>
        </div>

        <div
          className="card"
          style={{
            marginBottom: 18,
            padding: "14px 22px",
            background: "var(--paper-2)",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            fontSize: 13,
          }}
        >
          {[
            {
              c: "var(--moss)",
              l: "Active",
              n: DISTRICTS.filter((d) => d.status === "active").length,
            },
            {
              c: "var(--terra)",
              l: "Field-visited",
              n: DISTRICTS.filter((d) => d.status === "field-visited").length,
            },
            {
              c: "var(--muted)",
              l: "Researching",
              n: DISTRICTS.filter((d) => d.status === "researching").length,
            },
          ].map((s) => (
            <div
              key={s.l}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: s.c,
                }}
              ></div>
              <span>
                <strong>{s.n}</strong> {s.l.toLowerCase()}
              </span>
            </div>
          ))}
        </div>

        <div className="grid-3">
          {DISTRICTS.slice(0, 3).map((d) => {
            const statusColor =
              d.status === "active"
                ? "var(--moss)"
                : d.status === "field-visited"
                  ? "var(--terra)"
                  : "var(--muted)";
            return (
              <button
                key={d.id}
                onClick={() => navigate("where")}
                className="card frame"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <Placeholder
                  label={d.id}
                  tone={d.priority === "critical" ? "terra" : "moss"}
                  aspect="3/2"
                />
                <div
                  style={{
                    marginTop: 16,
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
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {d.elevation} · {d.rainfall}
                  </div>
                  <Chip style={{ borderColor: statusColor, color: statusColor }}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: statusColor,
                        display: "inline-block",
                        marginRight: 4,
                      }}
                    ></span>
                    {d.status}
                  </Chip>
                </div>
                <h3 style={{ marginTop: 6, marginBottom: 8 }}>{d.name}</h3>
                <p style={{ color: "var(--ink-2)", margin: 0, fontSize: 14 }}>
                  {d.summary}
                </p>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                  }}
                >
                  {d.species.map((s) => (
                    <span
                      key={s}
                      className="tag"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 12,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FARMERS */}
      <section className="shell section" style={{ paddingTop: 16 }}>
        <Ornament label="The people doing the work" />
        <div style={{ height: 28 }}></div>
        <div className="grid-3">
          {FARMERS.slice(0, 3).map((f, i) => (
            <button
              key={f.id}
              onClick={() => navigate("browse")}
              className="card"
              style={{
                background: i === 1 ? "var(--paper-2)" : "var(--paper)",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Placeholder
                  label={f.name.split(" ")[0]}
                  tone={f.photoTone === "neutral" ? "neutral" : f.photoTone}
                  style={{ width: 56, height: 56, borderRadius: "50%" }}
                  aspect={null}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                    {f.name}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {f.village}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 19,
                  lineHeight: 1.4,
                  color: "var(--ink-2)",
                  borderLeft: "2px solid var(--terra)",
                  paddingLeft: 14,
                }}
              >
                &quot;{f.quoteEn}&quot;
              </div>
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span>{f.years} yrs with us</span>
                <span>{f.treesPlanted} trees</span>
                <span>{f.plot.split("·")[0].trim()}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell" style={{ paddingTop: 16, paddingBottom: 80 }}>
        <div
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: "var(--radius-lg)",
            padding: "64px 56px",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 40,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "color-mix(in oklch, var(--moss) 60%, transparent)",
              filter: "blur(40px)",
              opacity: 0.6,
            }}
          ></div>
          <div style={{ position: "relative" }}>
            <h2 style={{ marginBottom: 16 }}>
              One tree.
              <br />
              <em>One farmer&apos;s afternoon.</em>
              <br />
              One acre of forest closer.
            </h2>
            <p
              style={{
                color: "color-mix(in oklch, var(--paper) 70%, transparent)",
                maxWidth: 480,
                marginBottom: 24,
              }}
            >
              Start with a single tree. We&apos;ll show you exactly where it went,
              who planted it, and how it&apos;s doing — for the next twenty years.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn"
                style={{
                  background: "var(--paper)",
                  color: "var(--ink)",
                  borderColor: "var(--paper)",
                }}
                onClick={() => navigate("browse")}
              >
                Plant my first tree <span className="arrow">→</span>
              </button>
              <button
                className="btn ghost"
                style={{
                  color: "var(--paper)",
                  borderColor:
                    "color-mix(in oklch, var(--paper) 40%, transparent)",
                }}
                onClick={() => navigate("farmer")}
              >
                I&apos;m a farmer or partner
              </button>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div
              className="card"
              style={{
                background: "color-mix(in oklch, var(--paper) 8%, transparent)",
                borderColor:
                  "color-mix(in oklch, var(--paper) 25%, transparent)",
                color: "var(--paper)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "color-mix(in oklch, var(--paper) 60%, transparent)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Pilot tally
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  ["96", "trees planted"],
                  ["5", "farmers paid"],
                  ["142", "donors"],
                  ["100%", "direct"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div
                      style={{ fontFamily: "var(--font-display)", fontSize: 38 }}
                    >
                      {n}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color:
                          "color-mix(in oklch, var(--paper) 60%, transparent)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="shell footer">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: 32,
          }}
        >
          <div>
            <Logo />
            <p style={{ marginTop: 14, fontSize: 13, maxWidth: 300 }}>
              A direct line between people who want forests and the farmers who
              can grow them. We don&apos;t take your money — we just make the
              introduction.
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Plant
            </div>
            <div className="col" style={{ gap: 6, fontSize: 13 }}>
              <a className="link">Farmers</a>
              <a className="link">Regions</a>
              <a className="link">Species we plant</a>
              <a className="link">Gift a tree</a>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              About
            </div>
            <div className="col" style={{ gap: 6, fontSize: 13 }}>
              <a className="link">How it works</a>
              <a className="link">Why we don&apos;t take your money</a>
              <a className="link">Verification process</a>
              <a className="link">Mistakes we&apos;ve made</a>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Connect
            </div>
            <div className="col" style={{ gap: 6, fontSize: 13 }}>
              <a className="link">Newsletter</a>
              <a className="link">If you&apos;re a farmer</a>
              <a className="link">If you&apos;re a partner</a>
              <a className="link">Reach the team</a>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            paddingTop: 20,
            borderTop: "1px dotted var(--line-2)",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span>
            PlantTree.life · not a registered NGO · payments go directly to
            farmers
          </span>
          <span>Currently active: Uttarakhand · India</span>
        </div>
      </footer>
    </div>
  );
}
