"use client";

import React from "react";
import { Chip, Ornament, Stamp } from "@/components/shared";
import type { Screen } from "./types";

export function How({ navigate }: { navigate: (s: Screen) => void }) {
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
                full transparency
              </Stamp>
              <Chip>4-step flow</Chip>
            </div>
            <h1 style={{ marginBottom: 40 }}>
              How it actually <em>works</em>,
              <br />
              end to end.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.5,
                color: "var(--ink-2)",
                maxWidth: 540,
              }}
            >
              From the moment you pick a farmer to the photo that lands in your
              inbox seven days later — and what happens for the twenty years
              after. No marketing fluff. The actual mechanics.
            </p>
          </div>
          <div
            className="card frame"
            style={{ padding: 24, background: "var(--paper)" }}
          >
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              The whole loop, in plain terms
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--ink-2)",
              }}
            >
              <li>
                <strong>You pick</strong> a farmer and a tier
              </li>
              <li>
                <strong>You pay</strong> the farmer directly via UPI
              </li>
              <li>
                <strong>A private thread opens</strong> between you and the
                farmer on PlantTree
              </li>
              <li>
                <strong>They plant</strong>, photograph in-thread, we publish to
                your tree page
              </li>
              <li>
                <strong>You watch</strong> it grow for 20 years
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* THE 4 STEPS — detailed */}
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <Ornament label="The four steps · expanded" />
        <div style={{ height: 28 }}></div>

        <div className="col" style={{ gap: 32 }}>
          {/* STEP 1 — Choose */}
          <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.4fr 1.6fr" }}>
              <div
                style={{
                  background:
                    "color-mix(in oklch, var(--moss-soft) 50%, var(--paper))",
                  padding: "36px 28px",
                  borderRight: "1px dashed var(--line-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--moss)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  step 01
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 88,
                    lineHeight: 1,
                    marginTop: 6,
                    color: "var(--moss)",
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginTop: 6,
                  }}
                >
                  Choose a farmer
                </div>
              </div>
              <div style={{ padding: "36px 32px" }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  You start at <em>Farmers</em>. Each profile shows the
                  farmer&apos;s photo, their village, how long they&apos;ve been
                  with us, the species they plant, and their UPI ID. Browse by
                  district on the map, or scroll the full list.
                </p>
                <hr className="dotted-rule" style={{ margin: "20px 0" }} />
                <div className="grid-3" style={{ gap: 16 }}>
                  {[
                    {
                      t: "Read the story",
                      d: "Why they plant. What grew there before. What's broken now. In their words — Hindi original + English translation.",
                    },
                    {
                      t: "See the data",
                      d: "District elevation, rainfall, soil profile, species recommended by our local foresters.",
                    },
                    {
                      t: "Pick a tier",
                      d: "Plant only · Plant + 1 year of care · Grove of 5. Care covers watering, mulch, and one free replant if the tree dies.",
                    },
                  ].map((b) => (
                    <div key={b.t}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          marginBottom: 6,
                        }}
                      >
                        {b.t}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                        {b.d}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn ghost sm"
                  style={{ marginTop: 22 }}
                  onClick={() => navigate("browse")}
                >
                  Try it · browse farmers <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2 — Pay directly */}
          <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.4fr 1.6fr" }}>
              <div
                style={{
                  background:
                    "color-mix(in oklch, var(--terra-soft) 40%, var(--paper))",
                  padding: "36px 28px",
                  borderRight: "1px dashed var(--line-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--terra)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  step 02
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 88,
                    lineHeight: 1,
                    marginTop: 6,
                    color: "var(--terra)",
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginTop: 6,
                  }}
                >
                  Pay directly
                </div>
              </div>
              <div style={{ padding: "36px 32px" }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  This is the part most people get wrong about us.{" "}
                  <strong>We never take your money.</strong> Your payment goes
                  straight from your bank account to the farmer&apos;s bank
                  account via UPI. No intermediary, no escrow, no platform fee.
                </p>
                <hr className="dotted-rule" style={{ margin: "20px 0" }} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 18,
                    marginBottom: 22,
                  }}
                >
                  {[
                    {
                      method: "Method 1",
                      title: "Scan the QR",
                      body: "Open GPay, PhonePe, Paytm, or any UPI app. Scan the QR on the farmer's profile. The amount is pre-filled. Tap Pay.",
                    },
                    {
                      method: "Method 2",
                      title: "Copy the UPI ID",
                      body: "Each farmer has a public UPI ID (e.g. sunita.devi@oksbi). Copy it, paste it into your app, and pay with the suggested reference code.",
                    },
                    {
                      method: "Method 3",
                      title: "One-tap deeplink",
                      body: "On a phone, the 'Pay now' button opens your default UPI app with everything pre-filled. One tap to send.",
                    },
                  ].map((m) => (
                    <div
                      key={m.method}
                      className="card"
                      style={{ background: "var(--paper-2)", padding: 16 }}
                    >
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        {m.method}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          marginBottom: 6,
                        }}
                      >
                        {m.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--ink-2)",
                          lineHeight: 1.5,
                        }}
                      >
                        {m.body}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      padding: 18,
                      background:
                        "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))",
                      borderRadius: 10,
                      borderLeft: "3px solid var(--moss)",
                    }}
                  >
                    <div className="eyebrow" style={{ marginBottom: 8 }}>
                      What we do receive
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--ink-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      A confirmation that you paid — your name, email,
                      optionally a screenshot of the payment. We log it and
                      assign your tree a number. Nothing more.
                    </p>
                  </div>
                  <div
                    style={{
                      padding: 18,
                      background:
                        "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))",
                      borderRadius: 10,
                      borderLeft: "3px solid var(--terra)",
                    }}
                  >
                    <div className="eyebrow" style={{ marginBottom: 8 }}>
                      What we don&apos;t receive
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--ink-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      Your money. Not as a fee, not as a hold, not even
                      temporarily. We have no bank account that can accept
                      donations. This is intentional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 — Plant & verify */}
          <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.4fr 1.6fr" }}>
              <div
                style={{
                  background:
                    "color-mix(in oklch, var(--moss-soft) 50%, var(--paper))",
                  padding: "36px 28px",
                  borderRight: "1px dashed var(--line-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--moss)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  step 03
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 88,
                    lineHeight: 1,
                    marginTop: 6,
                    color: "var(--moss)",
                  }}
                >
                  3
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginTop: 6,
                  }}
                >
                  Plant &amp; verify
                </div>
              </div>
              <div style={{ padding: "36px 32px" }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  Within 24 hours, a private thread opens between you and the
                  farmer on PlantTree — they get a notification with your tree
                  number. They plant within 7 days. They post a photo in-thread
                  (with a wooden tag bearing your tree number) and it appears
                  on your private tree page automatically.
                </p>
                <hr className="dotted-rule" style={{ margin: "20px 0" }} />

                <div className="eyebrow" style={{ marginBottom: 14 }}>
                  The 7-day timeline
                </div>
                <div style={{ position: "relative", paddingLeft: 28 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: "var(--line-2)",
                    }}
                  ></div>
                  {[
                    { d: "Day 0", t: "You pay via UPI", who: "you" },
                    {
                      d: "Day 0",
                      t: "Receipt emailed · private thread opens",
                      who: "us",
                    },
                    {
                      d: "Day 1",
                      t: "Farmer reads the thread · acknowledges payment",
                      who: "farmer",
                    },
                    {
                      d: "Day 2–3",
                      t: "Farmer fetches sapling from nursery, prepares the plot",
                      who: "farmer",
                    },
                    {
                      d: "Day 4–7",
                      t: "Sapling planted. Tag with your number staked next to it.",
                      who: "farmer",
                    },
                    {
                      d: "Day 7",
                      t: "Farmer posts photo in-thread. We mirror to your tree page.",
                      who: "farmer",
                    },
                    {
                      d: "Day 7",
                      t: "Email to you: “Your tree is in the ground.”",
                      who: "us",
                    },
                  ].map((e, i) => (
                    <div
                      key={i}
                      style={{ position: "relative", paddingBottom: 16 }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -28,
                          top: 4,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "var(--paper)",
                          border: `2px solid ${
                            e.who === "us"
                              ? "var(--terra)"
                              : e.who === "farmer"
                                ? "var(--moss)"
                                : "var(--ink)"
                          }`,
                        }}
                      ></div>
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          alignItems: "baseline",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--muted)",
                            letterSpacing: "0.06em",
                            width: 70,
                            flexShrink: 0,
                          }}
                        >
                          {e.d}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "var(--ink-2)",
                            flex: 1,
                          }}
                        >
                          {e.t}
                        </div>
                        <Chip>{e.who}</Chip>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 18,
                    background: "var(--paper-2)",
                    borderRadius: 10,
                  }}
                >
                  <div className="eyebrow" style={{ marginBottom: 8 }}>
                    What if the photo doesn&apos;t come?
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "var(--ink-2)",
                      lineHeight: 1.5,
                    }}
                  >
                    If day 10 passes without a planting photo, we mark your tree
                    publicly &quot;awaiting&quot; and chase the farmer in-thread.
                    If day 14 passes, we publicly refund you (we ask the farmer
                    to return the funds, or we cover them out of operator funds)
                    and remove the farmer from our list. This has happened twice
                    in 96 trees — and both times the photo was just delayed by
                    bad network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 — Track */}
          <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.4fr 1.6fr" }}>
              <div
                style={{
                  background:
                    "color-mix(in oklch, var(--terra-soft) 40%, var(--paper))",
                  padding: "36px 28px",
                  borderRight: "1px dashed var(--line-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--terra)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  step 04
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 88,
                    lineHeight: 1,
                    marginTop: 6,
                    color: "var(--terra)",
                  }}
                >
                  4
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginTop: 6,
                  }}
                >
                  Track it grow
                </div>
              </div>
              <div style={{ padding: "36px 32px" }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  Your tree gets a private page — a link emailed to you,
                  viewable forever. It updates with new photos every couple of
                  months. You see it through its first dry season, its first
                  acorn drop, its first decade.
                </p>
                <hr className="dotted-rule" style={{ margin: "20px 0" }} />
                <div className="grid-3" style={{ gap: 16 }}>
                  {[
                    {
                      t: "Photo updates",
                      d: "Every 2 months for the first year. Then twice a year. Posted by the farmer in your private thread.",
                    },
                    {
                      t: "Milestones",
                      d: "Survived first month · cleared first dry season · first metre · first acorn. Each marked on your timeline.",
                    },
                    {
                      t: "Send the farmer a tip",
                      d: "If you want to thank them, you can send another UPI payment any time. We don't take a cut of that either.",
                    },
                  ].map((b) => (
                    <div key={b.t}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          marginBottom: 6,
                        }}
                      >
                        {b.t}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                        {b.d}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn ghost sm"
                  style={{ marginTop: 22 }}
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.href = "/donor";
                  }}
                >
                  See an example tree page <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="shell section">
        <Ornament label="The three tiers · in detail" />
        <div style={{ height: 28 }}></div>
        <div className="grid-3">
          {[
            {
              name: "Plant only",
              price: "₹400 – ₹800",
              note: "varies by farmer · sapling cost",
              what: [
                "Native sapling from a local nursery",
                "Farmer plants on their own land",
                "First photo sent on planting day",
              ],
              risks: [
                "No follow-up watering covered",
                "Year-1 survival ~70%",
                "No replant if it dies",
              ],
              forWho: "If you want the absolute leanest contribution.",
              accent: "var(--moss)",
            },
            {
              name: "Plant + 1 yr care",
              price: "₹1,200 – ₹2,200",
              note: "recommended",
              what: [
                "Everything in Plant only",
                "Watering through dry seasons",
                "Mulching, weeding, basic protection",
                "1 free replant if the tree dies in year 1",
                "Photo updates every 2 months",
              ],
              risks: [
                "Year-1 survival rises to ~94%",
                "Care is paid in two parts: ₹1,200 on planting, balance after first 3-month update",
              ],
              forWho: "If you want this to actually be a tree at the end.",
              accent: "var(--terra)",
            },
            {
              name: "Grove of 5",
              price: "₹6,000 – ₹11,000",
              note: "mixed species · 5 trees",
              what: [
                "Five saplings, mixed species suited to the plot",
                "All care included for 1 year",
                "Single tree page showing all five",
                "Best for gifting or honoring someone",
              ],
              risks: [
                "Diverse plantings have ~2× the carbon capture of monoculture",
                "Care funds split across the 5 saplings",
              ],
              forWho: "If you want real ecological diversity, not a single tree.",
              accent: "var(--ink)",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="card frame"
              style={{ padding: 24, position: "relative" }}
            >
              {t.note === "recommended" && (
                <div style={{ position: "absolute", top: -10, right: 18 }}>
                  <Stamp color="var(--terra)" rotation={4}>
                    recommended
                  </Stamp>
                </div>
              )}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  marginBottom: 4,
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 32,
                  color: t.accent,
                }}
              >
                {t.price}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {t.note}
              </div>
              <hr className="dotted-rule" style={{ margin: "12px 0" }} />
              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  What&apos;s included
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: 13,
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {t.what.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Honest caveats
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: 13,
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {t.risks.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "var(--ink-2)",
                  borderLeft: `2px solid ${t.accent}`,
                  paddingLeft: 12,
                  marginTop: 18,
                }}
              >
                {t.forWho}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MONEY FLOW VISUAL */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <Ornament label="Follow the money" />
        <div style={{ height: 28 }}></div>
        <div className="card frame" style={{ padding: 32 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 50px 1.1fr 50px 1fr",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: 18,
                background: "var(--paper-2)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                You
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  lineHeight: 1.15,
                }}
              >
                Your bank
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-2)",
                  marginTop: 6,
                }}
              >
                HDFC / SBI / etc.
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--moss)",
              }}
            >
              <div>→ UPI →</div>
              <div style={{ marginTop: 4, color: "var(--muted)" }}>
                (NPCI rails)
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: 18,
                background:
                  "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))",
                borderRadius: 12,
                borderLeft: "3px solid var(--moss)",
                borderRight: "3px solid var(--moss)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--moss)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Direct
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  lineHeight: 1.15,
                }}
              >
                Farmer&apos;s&nbsp;bank
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-2)",
                  marginTop: 6,
                }}
              >
                SBI / Coop bank
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              →
            </div>
            <div
              style={{
                textAlign: "center",
                padding: 18,
                background: "var(--paper-2)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                To buy
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  lineHeight: 1.15,
                }}
              >
                Sapling, water, time
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-2)",
                  marginTop: 6,
                }}
              >
                at the village level
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 28,
              padding: 18,
              background:
                "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))",
              borderRadius: 10,
              borderLeft: "3px solid var(--terra)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Where PlantTree.life sits in this picture
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--ink-2)",
                lineHeight: 1.5,
              }}
            >
              We&apos;re not on the diagram. We don&apos;t sit between your bank
              and the farmer&apos;s bank. We&apos;re a website that introduced
              you, an in-platform messaging thread that hosts the conversation,
              and a tree page that hosts the photo when it comes back. That&apos;s
              the whole thing.
            </p>
          </div>
        </div>
      </section>

      {/* FULL FAQ */}
      <section className="shell" style={{ paddingTop: 16, paddingBottom: 80 }}>
        <Ornament label="Frequently asked" />
        <div style={{ height: 28 }}></div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.7fr 1.3fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 16 }}>
              The questions
              <br />
              we get <em>most</em>
            </h2>
            <p style={{ color: "var(--ink-2)" }}>
              If we missed yours, write to us — every email gets answered by a
              human (the founder).
            </p>
          </div>
          <div>
            {[
              [
                "Are you a registered NGO?",
                "Not yet. We're an early-stage project — a website that connects you to farmers. We will register as a Section 8 company or trust once we have enough trees in the ground to justify the paperwork (and the legal cost). Until then we're radically transparent about being just a directory.",
              ],
              [
                "Will I get a tax deduction?",
                "Not yet — that requires 80G registration, which only comes after charity registration. If you need a tax write-off today, use a registered NGO like SankalpTaru or Grow-Trees. If you want every rupee to reach a farmer, use us.",
              ],
              [
                "How do you verify the planting?",
                "Within 7 days of payment, the farmer posts a photo of the sapling in the ground — with a wooden tag bearing your tree number — in your private thread. We mirror it to your tree page. We've also visited every active plot in person at least once.",
              ],
              [
                "What if the tree dies?",
                "Saplings die — about 20–30% in year one even with care, more in tough years. For 'Plant + care' the farmer replants once for free. For 'Plant only' it's a one-time risk we don't shield you from. Either way, when a tree dies, we mark it on your page; we don't hide it.",
              ],
              [
                "Who picks the species?",
                "The farmer picks from a short list we make with local foresters, Krishi Vigyan Kendras, and the district forest department. Only native species suited to the soil and elevation. No eucalyptus. No chir pine in new plantings.",
              ],
              [
                "Why only Uttarakhand right now?",
                "Because we want to do one place well before doing many places badly. Our founder is from here and can verify every farmer in person. A region only goes 'active' after a site visit. Expansion to new regions happens after the current one hits 1,000 verified trees.",
              ],
              [
                "Can I gift a tree?",
                "Yes — during checkout, enter the recipient's name and email. They get a digital certificate with your tree number, and all photo updates land in their inbox. We're working on a print certificate too.",
              ],
              [
                "Can companies buy in bulk?",
                "We accept small bulk orders (10–50 trees) at the same rate as individual ones. For larger orders (100+) please email us — at that scale we want to introduce you to the farmers personally, and we can also help structure it for your CSR reporting once we're 80G registered.",
              ],
              [
                "What's your relationship with the farmer?",
                "Independent. We don't employ them. We don't own their land. We don't take a cut of what you pay them. We made a public introduction, we hold them to the photo-proof and care standard, and we drop them if they fail to deliver. That's the entire relationship.",
              ],
              [
                "How are you funded?",
                "Separately — and honestly, modestly. Right now the founder is covering hosting, travel, and operations out of pocket. We'll publish a real funding statement when we register formally. We don't want to be funded out of donor payments, ever.",
              ],
              [
                "What does 'photo proof' actually look like?",
                "A clear photograph from the farmer's phone: the sapling in the prepared hole, the wooden tag with your tree number visible next to it, ideally the farmer's face in frame. We've published the standard so you can compare.",
              ],
              [
                "Can I visit my tree?",
                "Yes. Once it's been planted and the farmer agrees, we can arrange a visit. Several donors have already done this. Please give two weeks' notice — the farmers are not running a tourist operation.",
              ],
            ].map(([q, a], i) => (
              <details
                key={i}
                style={{
                  borderBottom: "1px dotted var(--line-2)",
                  padding: "16px 0",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span>{q}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    marginTop: 12,
                    color: "var(--ink-2)",
                    marginBottom: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
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
              You&apos;ve read how it works.
              <br />
              <em>Now do it.</em>
            </h2>
            <p
              style={{
                color: "color-mix(in oklch, var(--paper) 70%, transparent)",
                maxWidth: 460,
                marginBottom: 0,
              }}
            >
              Pick a farmer. Pay them ₹500. Get a photo in a week. Twenty years
              of growth, yours to follow.
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
              onClick={() => navigate("where")}
            >
              Where we plant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
