"use client";

import React, { useState } from "react";
import {
  Chip,
  Ornament,
  Stamp,
  UttarakhandMap,
} from "@/components/shared";
import {
  COMING_NEXT,
  DISTRICTS,
  FARMERS,
  SCIENCE_AXES,
  type DistrictStatus,
} from "@/lib/data";
import type { Screen } from "./types";

export function Where({ navigate }: { navigate: (s: Screen) => void }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DistrictStatus | "all">("all");

  const filtered =
    statusFilter === "all"
      ? DISTRICTS
      : DISTRICTS.filter((d) => d.status === statusFilter);
  const counts = {
    active: DISTRICTS.filter((d) => d.status === "active").length,
    "field-visited": DISTRICTS.filter((d) => d.status === "field-visited").length,
    researching: DISTRICTS.filter((d) => d.status === "researching").length,
  };

  return (
    <div>
      {/* HERO */}
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 56,
            alignItems: "end",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <Stamp color="var(--terra)" rotation={-3}>
                open scope
              </Stamp>
              <Chip>Uttarakhand · India</Chip>
            </div>
            <h1 style={{ marginBottom: 40 }}>
              Every degrading plot
              <br />
              <em>deserves a tree</em>.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                maxWidth: 560,
              }}
            >
              Wherever land is going bare, wherever the canopy is thinning,
              wherever a spring is drying up — we want a farmer on that plot.
              Two people meet here:
              <em> those with money but no time</em>, and{" "}
              <em>those with time but no money</em>. The science isn&apos;t a
              gate. It&apos;s the shared knowledge we bring so the tree actually
              survives.
            </p>
          </div>
          <div
            className="card frame"
            style={{ padding: 24, background: "var(--paper)" }}
          >
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Where we are today
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
                  {counts.active}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--moss)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  planting
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
                  {counts["field-visited"]}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--terra)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  field-visited
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
                  {counts.researching}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  on the list
                </div>
              </div>
            </div>
            <hr className="dotted-rule" style={{ margin: "18px 0" }} />
            <div
              style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}
            >
              <strong>{DISTRICTS.length} districts</strong> in our active scope —
              and growing. Plots move from{" "}
              <span style={{ color: "var(--muted)" }}>on the list</span> →{" "}
              <span style={{ color: "var(--terra)" }}>field-visited</span> →{" "}
              <span style={{ color: "var(--moss)" }}>planting</span> as we meet
              the farmers and find seedling stock.
            </div>
            <button className="btn ghost sm" style={{ marginTop: 16 }}>
              Know a plot that needs trees? <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* THE SCIENCE */}
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <Ornament label="The six-axis playbook" />
        <div style={{ height: 28 }}></div>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            maxWidth: 720,
            marginBottom: 32,
          }}
        >
          This isn&apos;t a checklist we use against farmers — it&apos;s a guide
          we share <em>with</em> them. A tree only survives if the soil, water,
          species, and community all fit. Six questions, asked honestly, help
          farmers pick a tree that will still be alive in twenty years.
        </p>
        <div className="grid-2" style={{ gap: 18 }}>
          {SCIENCE_AXES.map((a, i) => (
            <div
              key={a.title}
              className="card frame"
              style={{ padding: 24, position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: 22,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  background: "var(--paper)",
                  color: "var(--muted)",
                  padding: "2px 8px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  letterSpacing: "0.1em",
                }}
              >
                axis {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                  marginTop: 4,
                }}
              >
                <h3 style={{ fontSize: 24 }}>{a.title}</h3>
              </div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                {a.short}
              </div>
              <p
                style={{
                  color: "var(--ink-2)",
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                {a.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="card"
          style={{
            marginTop: 24,
            padding: "22px 28px",
            background: "var(--paper-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              The honest line
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontStyle: "italic",
                maxWidth: 660,
              }}
            >
              &quot;We&apos;re not doing anyone a favor by listing their plot. We&apos;re
              connecting their time to someone else&apos;s money.&quot;
            </div>
          </div>
        </div>
      </section>

      {/* MAP & FILTER */}
      <section className="shell" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Ornament label="Districts · status by status" />
        <div style={{ height: 28 }}></div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          <div style={{ position: "sticky", top: 88 }}>
            <UttarakhandMap
              pins={filtered}
              selected={selectedDistrict}
              onSelect={(id) =>
                setSelectedDistrict(id === selectedDistrict ? null : id)
              }
              height={460}
            />
            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {[
                { id: "all", label: "All districts", color: "var(--ink)" },
                {
                  id: "active",
                  label: `Planting (${counts.active})`,
                  color: "var(--moss)",
                },
                {
                  id: "field-visited",
                  label: `Field-visited (${counts["field-visited"]})`,
                  color: "var(--terra)",
                },
                {
                  id: "researching",
                  label: `On the list (${counts.researching})`,
                  color: "var(--muted)",
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    setStatusFilter(f.id as DistrictStatus | "all")
                  }
                  className="tag"
                  style={{
                    background:
                      statusFilter === f.id ? f.color : "var(--paper)",
                    color:
                      statusFilter === f.id ? "var(--paper)" : "var(--ink-2)",
                    border: `1px solid ${statusFilter === f.id ? f.color : "var(--line)"}`,
                    cursor: "pointer",
                    padding: "5px 12px",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              className="card"
              style={{
                marginTop: 18,
                padding: 18,
                background: "var(--paper-2)",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                How to read the status
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--moss)",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  ></div>
                  <div>
                    <strong>Planting</strong> — farmers signed up, trees in the
                    ground, donors active.
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--terra)",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  ></div>
                  <div>
                    <strong>Field-visited</strong> — plot walked, farmers
                    identified, first planting cycle being scheduled.
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--muted)",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  ></div>
                  <div>
                    <strong>On the list</strong> — soil and climate data
                    gathered. Awaiting a site visit.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col" style={{ gap: 18 }}>
            {filtered.map((d) => {
              const farmersHere = FARMERS.filter((f) => f.districtId === d.id);
              const statusColor =
                d.status === "active"
                  ? "var(--moss)"
                  : d.status === "field-visited"
                    ? "var(--terra)"
                    : "var(--muted)";
              return (
                <div key={d.id} className="card frame" style={{ padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 14,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 30,
                        }}
                      >
                        {d.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--muted)",
                          letterSpacing: "0.06em",
                          marginTop: 2,
                        }}
                      >
                        {d.elevation} · {d.rainfall}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                      }}
                    >
                      <Chip
                        style={{ borderColor: statusColor, color: statusColor }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: statusColor,
                            display: "inline-block",
                            marginRight: 4,
                          }}
                        ></span>
                        {d.status}
                      </Chip>
                      {d.activeSince && (
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--muted)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          since {d.activeSince}
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--ink-2)",
                      fontSize: 15,
                    }}
                  >
                    {d.summary}
                  </p>

                  <hr className="dotted-rule" style={{ margin: "16px 0" }} />

                  <div
                    style={{
                      padding: "14px 18px",
                      background:
                        "color-mix(in oklch, var(--terra-soft) 40%, var(--paper))",
                      borderRadius: 8,
                      borderLeft: "2px solid var(--terra)",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 17,
                      lineHeight: 1.4,
                      color: "var(--ink-2)",
                      marginBottom: 16,
                    }}
                  >
                    {d.why}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>
                      The history
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--ink-2)",
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {d.history}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 22,
                        }}
                      >
                        {d.canopy}%
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        canopy cover
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 22,
                          color: d.fireRisk.startsWith("high")
                            ? "var(--terra)"
                            : "var(--ink)",
                        }}
                      >
                        {d.fireRisk.split(" ")[0]}
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        fire risk
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 22,
                        }}
                      >
                        {d.status === "researching"
                          ? "—"
                          : d.treesPlanted.toLocaleString()}
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        trees planted
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 22,
                        }}
                      >
                        {farmersHere.length || "—"}
                      </div>
                      <div className="stat-label" style={{ marginTop: 2 }}>
                        farmers active
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 18,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        Soil
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                        {d.soil}
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        Native species we plant
                      </div>
                      <div
                        style={{
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
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 14,
                      background: "var(--paper-2)",
                      borderRadius: 8,
                    }}
                  >
                    <div className="eyebrow" style={{ marginBottom: 6 }}>
                      Field notes
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--ink-2)",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {d.fieldNotes}
                    </p>
                  </div>

                  {d.status === "active" && farmersHere.length > 0 && (
                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--muted)",
                        }}
                      >
                        {farmersHere.map((f) => f.name.split(" ")[0]).join(", ")}{" "}
                        planting here
                      </div>
                      <button
                        className="btn moss sm"
                        onClick={() => navigate("browse")}
                      >
                        See farmers <span className="arrow">→</span>
                      </button>
                    </div>
                  )}
                  {d.status === "field-visited" && (
                    <div
                      style={{
                        marginTop: 16,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--terra)",
                      }}
                    >
                      ✦ First planting cycle scheduled · check back soon
                    </div>
                  )}
                  {d.status === "researching" && (
                    <div
                      style={{
                        marginTop: 16,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                      }}
                    >
                      ◌ On the list — site visit pending
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMING NEXT */}
      <section className="shell section">
        <Ornament label="On the radar — plots we want to list next" />
        <div style={{ height: 28 }}></div>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            maxWidth: 640,
            marginBottom: 26,
          }}
        >
          Beyond the districts above, these are plots we&apos;re already in
          conversation about — panchayats we&apos;ve called, farmers who&apos;ve
          reached out, NGOs we&apos;re partnering with. Help us reach them faster.
        </p>
        <div className="grid-4">
          {COMING_NEXT.map((c) => (
            <div
              key={c.name}
              className="card"
              style={{
                background: "var(--paper-2)",
                borderStyle: "dashed",
                padding: 18,
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                {c.note}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                ◌ on the list
              </div>
            </div>
          ))}
        </div>
        <div
          className="card"
          style={{
            marginTop: 18,
            padding: 18,
            background: "var(--paper)",
            borderStyle: "dashed",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 14, color: "var(--ink-2)" }}>
            <strong>
              Know a degrading plot, or a farmer who wants to plant?
            </strong>{" "}
            Tell us — we&apos;ll add it to the list and start the conversation.
          </div>
          <button className="btn moss sm">
            Suggest a plot <span className="arrow">→</span>
          </button>
        </div>
      </section>

      {/* DATA & SOURCES */}
      <section className="shell" style={{ paddingTop: 16, paddingBottom: 80 }}>
        <Ornament label="Where the data comes from" />
        <div style={{ height: 20 }}></div>
        <div className="grid-3">
          {[
            {
              src: "Sentinel-2",
              what: "NDVI satellite imagery for canopy and biomass tracking",
              who: "European Space Agency · open data",
            },
            {
              src: "IMD",
              what: "30-year district rainfall and temperature records",
              who: "India Meteorological Department",
            },
            {
              src: "FSI",
              what: "Forest cover maps and species distribution",
              who: "Forest Survey of India · biennial reports",
            },
            {
              src: "Soil labs",
              what: "Composition, pH, organic matter per plot",
              who: "Dehradun-based labs we contract with",
            },
            {
              src: "Local foresters",
              what: "Native species recommendations",
              who: "Krishi Vigyan Kendras + Van Panchayats",
            },
            {
              src: "Field visits",
              what:
                "Plot inspections, farmer conversations, ground photos",
              who: "Us · in person · always",
            },
          ].map((s) => (
            <div key={s.src} className="card frame" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                {s.who}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  marginBottom: 6,
                }}
              >
                {s.src}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
                {s.what}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell" style={{ paddingBottom: 80 }}>
        <div
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: "var(--radius-lg)",
            padding: "44px 48px",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 12 }}>
              Read the science.
              <br />
              <em>Now meet the people.</em>
            </h2>
            <p
              style={{
                color: "color-mix(in oklch, var(--paper) 70%, transparent)",
                maxWidth: 460,
                marginBottom: 0,
              }}
            >
              The farmers planting in these districts have stories worth your
              time. Each profile says exactly which trees they&apos;re putting in
              the ground and why.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn"
              style={{
                background: "var(--paper)",
                color: "var(--ink)",
                borderColor: "var(--paper)",
              }}
              onClick={() => navigate("browse")}
            >
              Meet the farmers <span className="arrow">→</span>
            </button>
            <button
              className="btn ghost"
              style={{
                color: "var(--paper)",
                borderColor:
                  "color-mix(in oklch, var(--paper) 40%, transparent)",
              }}
              onClick={() => navigate("how")}
            >
              How it works
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
