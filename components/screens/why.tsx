"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip, Ornament, Placeholder, Stamp, TreeViz } from "@/components/shared";
import type { Screen } from "./types";

// The "why this exists" page — a scroll-driven narrative, built with plain
// SVG + CSS + IntersectionObserver (no animation runtime shipped to phones).
// Beat by beat: the universal ache (you give, then silence) → we take the wall
// down → your money flows straight to a farmer → a real tree grows as you
// scroll → you never have to wonder again. Mirrors the trust spine the rest of
// the site already states in text (see landing.tsx "No middlemen" + how.tsx
// "Follow the money"), but lets the visitor *feel* the question first.

// Inline CSS custom properties (--reveal-delay etc.) aren't in React's
// CSSProperties; this widens the type without an `any` cast at each use site.
type CSSVars = React.CSSProperties & Record<string, string | number>;

// ---------- in-view hook (IntersectionObserver, SSR-safe) ----------
function useInView<T extends Element = HTMLDivElement>(
  threshold = 0.2,
  rootMargin?: string,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true); // graceful fallback: just show everything
      return;
    }
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          ob.disconnect(); // reveal once, then stop watching
        }
      },
      { threshold, rootMargin },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold, rootMargin]);
  return { ref, inView };
}

// ---------- reveal-on-scroll wrapper ----------
function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView(0.18);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}s`, ...style } as CSSVars}
    >
      {children}
    </div>
  );
}

// ---------- a small rupee coin ----------
function Coin({ size = 46 }: { size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 34% 28%, var(--amber), color-mix(in oklch, var(--terra) 72%, var(--amber)))",
        border: "2px solid color-mix(in oklch, var(--terra) 55%, var(--ink))",
        color: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: Math.round(size * 0.52),
        lineHeight: 1,
        boxShadow: "0 4px 10px rgba(0,0,0,0.16)",
      }}
    >
      ₹
    </div>
  );
}

// ---------- a parcel/box, either sealed shut or with a hinged lid ----------
function Box({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 170"
      width="100%"
      style={{ maxWidth: 240, display: "block" }}
      role="img"
      aria-label={open ? "An open box" : "A sealed box"}
    >
      <ellipse cx="110" cy="157" rx="80" ry="9" fill="var(--ink)" opacity="0.06" />
      {/* body */}
      <rect
        x="46"
        y="72"
        width="128"
        height="80"
        rx="8"
        fill="var(--paper-2)"
        stroke="var(--line-2)"
        strokeWidth="2"
      />
      <line
        x1="110"
        y1="72"
        x2="110"
        y2="152"
        stroke="var(--line-2)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      {/* what's inside, only meaningful once the lid lifts */}
      {open && (
        <g>
          <circle cx="110" cy="104" r="15" fill="color-mix(in oklch, var(--moss) 22%, var(--paper))" />
          <path
            d="M110 116 L110 96 M110 100 Q102 92, 97 96 Q104 100, 110 102 M110 102 Q118 94, 123 98 Q116 102, 110 104"
            stroke="var(--moss)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {/* lid — closed sits flat; open one gets the .why-lid hinge */}
      <rect
        className={open ? "why-lid" : undefined}
        x="40"
        y="58"
        width="140"
        height="20"
        rx="5"
        fill="var(--paper-3)"
        stroke="var(--line-2)"
        strokeWidth="2"
      />
      {!open && (
        <>
          <rect x="92" y="64" width="36" height="6" rx="3" fill="var(--ink)" opacity="0.45" />
          <text
            x="110"
            y="126"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="44"
            fill="var(--muted)"
          >
            ?
          </text>
        </>
      )}
    </svg>
  );
}

// ---------- two-worlds beat: a spinning clock, a steady sun, a stat row ----------
function Clock() {
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = 21;
    const r2 = i % 3 === 0 ? 16 : 19;
    ticks.push(
      <line
        key={i}
        x1={28 + r1 * Math.sin(a)}
        y1={28 - r1 * Math.cos(a)}
        x2={28 + r2 * Math.sin(a)}
        y2={28 - r2 * Math.cos(a)}
        stroke="var(--line-2)"
        strokeWidth={i % 3 === 0 ? 2 : 1}
      />,
    );
  }
  return (
    <svg viewBox="0 0 56 56" width="54" height="54" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r="25" fill="var(--paper)" stroke="var(--line-2)" strokeWidth="2" />
      {ticks}
      {/* hour hand sits still; the long hand whirls (you have no time) */}
      <line x1="28" y1="28" x2="28" y2="18" stroke="var(--ink-2)" strokeWidth="2.6" strokeLinecap="round" />
      <g className="why-clock-hand">
        <line x1="28" y1="31" x2="28" y2="9" stroke="var(--terra)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <circle cx="28" cy="28" r="2.4" fill="var(--ink)" />
    </svg>
  );
}

function Sun() {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    rays.push(
      <line
        key={i}
        x1={28 + 18 * Math.cos(a)}
        y1={28 + 18 * Math.sin(a)}
        x2={28 + 24 * Math.cos(a)}
        y2={28 + 24 * Math.sin(a)}
        stroke="var(--amber)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />,
    );
  }
  return (
    <svg viewBox="0 0 56 56" width="54" height="54" aria-hidden style={{ flexShrink: 0 }}>
      {rays}
      <circle cx="28" cy="28" r="13" fill="var(--amber)" opacity="0.9" />
      <circle
        cx="28"
        cy="28"
        r="13"
        fill="none"
        stroke="color-mix(in oklch, var(--terra) 50%, var(--amber))"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "9px 0",
        borderTop: "1px dotted var(--line-2)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: accent ?? "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

// ---------- the growing-tree card, mirrors the landing hero card ----------
const GROW_STEPS: {
  stage: 0 | 1 | 2 | 3 | 4;
  tag: string;
  badge: string;
  survived: string;
  eyebrow: string;
  body: React.ReactNode;
}[] = [
  {
    stage: 0,
    tag: "day 0",
    badge: "just paid",
    survived: "—",
    eyebrow: "Day 0",
    body: (
      <>
        You pay your farmer <strong>directly</strong> over UPI. A private thread
        opens between just the two of you, and your tree gets a number.
      </>
    ),
  },
  {
    stage: 1,
    tag: "day 7",
    badge: "planted",
    survived: "00",
    eyebrow: "Within 7 days",
    body: (
      <>
        A photo lands: your sapling in the ground, a wooden tag with{" "}
        <em>your tree&apos;s number</em> staked beside it. Proof, not a promise.
      </>
    ),
  },
  {
    stage: 2,
    tag: "month 4",
    badge: "growing",
    survived: "00",
    eyebrow: "Every couple of months",
    body: (
      <>
        New photos keep coming — through its first dry season, its first new
        leaf, its first metre of height. On a page that is yours.
      </>
    ),
  },
  {
    stage: 3,
    tag: "year 1",
    badge: "thriving",
    survived: "01",
    eyebrow: "Year one",
    body: (
      <>
        Milestones tick by: <em>survived the dry season</em>, first acorn drop.
        If it ever dies, we mark it on your page — we never quietly hide it.
      </>
    ),
  },
  {
    stage: 4,
    tag: "year 5+",
    badge: "established",
    survived: "05",
    eyebrow: "For twenty years",
    body: (
      <>
        It stops being a donation and becomes a tree you know by name — rooted,
        shading soil that needed it, still on a link that&apos;s yours forever.
      </>
    ),
  },
];

function ProofGrow() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      typeof window === "undefined"
    ) {
      setActive(GROW_STEPS.length - 1);
      return;
    }
    const mql = window.matchMedia("(max-width: 900px)");
    let ob: IntersectionObserver | null = null;

    const setup = () => {
      ob?.disconnect();
      const mobile = mql.matches;
      // On phones the tree is a tall, opaque sticky card pinned to the top, so
      // the "active" caption must land in the clear strip BELOW it, not behind
      // it. Push the activation band down on mobile; centre it on desktop where
      // the tree sits beside the captions.
      const rootMargin = mobile ? "-72% 0px -8% 0px" : "-45% 0px -45% 0px";
      const bandCentre = window.innerHeight * (mobile ? 0.82 : 0.5);
      ob = new IntersectionObserver(
        (entries) => {
          // Nearest-to-band-centre wins, so batched/out-of-order entries on a
          // fast flick can't flash the wrong stage (last-entry-wins would).
          const hits: { idx: number; dist: number }[] = [];
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (Number.isNaN(idx)) return;
            const r = e.boundingClientRect;
            hits.push({ idx, dist: Math.abs((r.top + r.bottom) / 2 - bandCentre) });
          });
          if (hits.length) {
            const best = hits.reduce((a, b) => (b.dist < a.dist ? b : a));
            setActive(best.idx);
          }
        },
        { rootMargin, threshold: 0 },
      );
      stepRefs.current.forEach((el) => el && ob!.observe(el));
    };

    setup();
    // re-init when crossing the breakpoint (orientation/resize) so the band stays right
    mql.addEventListener("change", setup);
    return () => {
      mql.removeEventListener("change", setup);
      ob?.disconnect();
    };
  }, []);

  const cur = GROW_STEPS[active];

  return (
    <div className="why-grow">
      {/* sticky, growing tree */}
      <div className="why-grow-viz">
        <div className="card frame" style={{ padding: 16, maxWidth: 380, margin: "0 auto" }}>
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
              Tree #PT-014 · {cur.tag}
            </div>
            <div className="badge-stage">{cur.badge}</div>
          </div>
          {/* re-key per stage so each growth step gives a small, on-brand pop */}
          <div key={active} className="why-pop">
            <TreeViz stage={cur.stage} height={300} />
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic" }}>
                Banj oak
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Tended by Sunita-ji, Almora
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                survived year
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                {cur.survived}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scrolling captions; each one bumps the tree as it crosses centre */}
      <div className="why-grow-steps">
        {GROW_STEPS.map((s, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="why-grow-step"
          >
            <div
              className="card"
              style={{
                background: i === active ? "var(--paper)" : "transparent",
                border: i === active ? "1px solid var(--line)" : "1px solid transparent",
                borderLeft: `3px solid ${i === active ? "var(--moss)" : "var(--line)"}`,
                transition: "background 0.4s ease, border-color 0.4s ease",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 8, color: "var(--moss)" }}>
                {s.eyebrow}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 19,
                  lineHeight: 1.5,
                  fontFamily: "var(--font-display)",
                  // de-emphasise inactive steps with colour, not opacity, so every
                  // caption clears WCAG AA contrast (ink-2 ≈ 9.9:1 over paper).
                  color: i === active ? "var(--ink)" : "var(--ink-2)",
                  transition: "color 0.4s ease",
                }}
              >
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Why({ navigate }: { navigate?: (s: Screen) => void }) {
  const router = useRouter();
  // In the SPA shell we get `navigate` and render inline like the other tabs.
  // On the standalone /why route we don't, so fall back to real routing and
  // deep-link the screen via ?screen= (app.tsx reads it on mount) — "Meet a
  // farmer" then lands on the farmer browser, not the home page.
  const go = (s: Screen) =>
    navigate ? navigate(s) : router.push(s === "browse" ? "/?screen=browse" : "/");

  // each "stage" scene flips an .in class onto a container so its child
  // SVG/CSS animation fires only once it's actually on screen.
  const worlds = useInView(0.35);
  const gap = useInView(0.35);
  const turn = useInView(0.4);
  const flow = useInView(0.35);
  const stay = useInView(0.35);

  return (
    <div className="why-page">
      {/* HERO — the question */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 28 }}>
        <Reveal>
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
              the honest answer
            </Stamp>
            <Chip>Why this exists</Chip>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 style={{ marginBottom: 28, maxWidth: 900 }}>
            When you give,
            <br />
            where does it <em className="squiggle">actually go</em>?
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p style={{ fontSize: 20, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 620 }}>
            You pay to do some good — plant a tree, feed a child, clean a river.
            And then… nothing. No photo. No proof. You never learn whether it
            worked, whether the tree lived, or whether your money quietly
            vanished into an office somewhere. PlantTree exists to end that
            silence.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div
            className="why-cue"
            style={{
              marginTop: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            <span>scroll to see where it really goes</span>
            <span style={{ fontSize: 15 }}>↓</span>
          </div>
        </Reveal>
      </section>

      {/* TWO WORLDS — why pay a farmer at all: a fair trade of capacities */}
      <section className="shell section">
        <Ornament label="Before the money · why a farmer at all" />
        <div style={{ height: 36 }} />
        <Reveal>
          <h2 style={{ maxWidth: 760, marginBottom: 16 }}>
            You have the will. They have the <em>hands</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p
            style={{
              maxWidth: 620,
              color: "var(--ink-2)",
              fontSize: 17,
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            You&apos;d plant it yourself if you could — but your days are full,
            and the land that needs trees is six hundred kilometres away,
            terraced into a hillside you&apos;ll never stand on. A farmer there
            has the opposite problem: the time, the skill, and the soil — and too
            few reasons to stay.
          </p>
        </Reveal>

        <div
          ref={worlds.ref as React.RefObject<HTMLDivElement>}
          className={`why-stage why-worlds ${worlds.inView ? "in" : ""}`}
        >
          {/* YOU — means, no time */}
          <div className="card frame" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              You · the city
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <Clock />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2 }}>
                Days that are
                <br />
                already full
              </div>
            </div>
            <Stat label="time" value="none" />
            <Stat label="means" value="yes" accent="var(--moss)" />
          </div>

          {/* THEM — time and soil, needs the means */}
          <div
            className="card frame"
            style={{
              padding: 24,
              background: "color-mix(in oklch, var(--moss-soft) 35%, var(--paper))",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 16, color: "var(--moss)" }}>
              Them · the hills
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <Sun />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2 }}>
                Time, skill,
                <br />
                and soil
              </div>
            </div>
            <Stat label="time" value="all day" accent="var(--moss)" />
            <Stat label="means" value="needs it" />
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--moss)",
          }}
        >
          ⇄ you trade what each of you has
        </div>

        <Reveal delay={0.08}>
          <p
            style={{
              textAlign: "center",
              maxWidth: 600,
              margin: "22px auto 0",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 20,
              color: "var(--ink)",
            }}
          >
            This isn&apos;t charity with extra steps. It&apos;s a fair division of
            labour.
          </p>
        </Reveal>
      </section>

      {/* THE GAP — coin into a sealed box, questions drifting up */}
      <section className="shell section">
        <Ornament label="The feeling we all know" />
        <div style={{ height: 36 }} />
        <div
          ref={gap.ref as React.RefObject<HTMLDivElement>}
          className={`why-stage ${gap.inView ? "in" : ""}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            justifyItems: "center",
            gap: 28,
            textAlign: "center",
          }}
        >
          <h2 style={{ maxWidth: 680 }}>
            Most giving is an act of <em>faith</em>.
          </h2>

          {/* the box + the falling coin + drifting question marks */}
          <div style={{ position: "relative", width: 240, height: 250, marginTop: 8 }}>
            <div className="why-coin">
              <Coin />
            </div>
            {[
              { left: "8%", qd: "0s", r: "-12deg" },
              { left: "82%", qd: "1.1s", r: "10deg" },
              { left: "26%", qd: "2.2s", r: "6deg" },
              { left: "66%", qd: "1.7s", r: "-8deg" },
            ].map((q, i) => (
              <span
                key={i}
                className="why-q"
                aria-hidden
                style={
                  {
                    position: "absolute",
                    top: 96,
                    left: q.left,
                    fontSize: 26,
                    color: "var(--muted)",
                    "--qd": q.qd,
                    "--r": q.r,
                  } as CSSVars
                }
              >
                ?
              </span>
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
              <Box />
            </div>
          </div>

          <div className="col" style={{ gap: 8, maxWidth: 520 }}>
            {[
              "Did a tree actually get planted?",
              "Is it still alive — or already dead?",
              "Did my money reach the ground, or an office?",
            ].map((q, i) => (
              <Reveal key={q} delay={0.1 * i}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 18,
                    color: "var(--ink-2)",
                  }}
                >
                  {q}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p style={{ maxWidth: 600, color: "var(--ink-2)", fontSize: 16, lineHeight: 1.6 }}>
              Your money goes over a wall you can&apos;t see past. Maybe
              something good happens on the other side. Maybe it doesn&apos;t.
              Either way, you&apos;re rarely shown. This isn&apos;t villainy —
              good charities do real, hard work — it&apos;s just{" "}
              <strong>distance</strong>. Distance between your hands and the soil.
            </p>
          </Reveal>
        </div>
      </section>

      {/* THE TURN — the wall comes down, the box opens */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 88 }}>
        <div
          ref={turn.ref as React.RefObject<HTMLDivElement>}
          className={`why-stage why-turn ${turn.inView ? "in" : ""}`}
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: "var(--radius-lg)",
            padding: "clamp(36px, 8vw, 52px) clamp(22px, 6vw, 44px)",
          }}
        >
          <div>
            <div
              className="eyebrow"
              style={{ marginBottom: 14, color: "color-mix(in oklch, var(--paper) 65%, transparent)" }}
            >
              The whole idea, in one move
            </div>
            <h2 style={{ marginBottom: 14 }}>
              So we took the <em>wall</em> down.
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 460,
                color: "color-mix(in oklch, var(--paper) 75%, transparent)",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              No box, no black hole, no &quot;trust us.&quot; Everything past
              this point — where your money goes, who plants the tree, whether
              it lives — you get to watch with your own eyes.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box open />
          </div>
        </div>
      </section>

      {/* FOLLOW THE MONEY — coin runs straight from you to the farmer */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 88 }}>
        <Ornament label="Step one · the money" />
        <div style={{ height: 36 }} />
        <Reveal>
          <h2 style={{ maxWidth: 760, marginBottom: 28 }}>
            Your money goes <em>straight</em> to a farmer.
          </h2>
        </Reveal>

        <div
          ref={flow.ref as React.RefObject<HTMLDivElement>}
          className={`why-stage card frame ${flow.inView ? "in" : ""}`}
          style={{ padding: "36px 32px" }}
        >
          <div className="why-flow-row">
            {/* You */}
            <div className="why-flow-node">
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                You
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                Your bank
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                HDFC / SBI / etc.
              </div>
            </div>

            {/* the wire (horizontal on desktop, vertical on phones), with a
                coin running straight across it from you to the farmer */}
            <div className="why-flow-track">
              <div className="why-flow-line" />
              <div className="why-flow-coin">
                <Coin size={36} />
              </div>
            </div>

            {/* Farmer */}
            <div
              className="why-flow-node"
              style={{
                borderColor: "var(--moss)",
                background: "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 6, color: "var(--moss)" }}>
                Direct
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                Farmer&apos;s bank
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                SBI / coop bank
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--moss)",
            }}
          >
            straight over UPI · NPCI rails
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 26,
              borderTop: "1.5px dotted var(--line-2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              <strong style={{ color: "var(--moss)" }}>100% of your money</strong>{" "}
              reaches the farmer.
              <br />
              We never touch it.
            </div>
            <p style={{ maxWidth: 620, margin: "0 auto", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>
              No escrow. No platform fee. No account that could even hold a
              donation if it tried. Your bank to the farmer&apos;s bank, over
              UPI — we&apos;re not standing in the path, taking a cut or adding a
              delay.
            </p>
          </div>
        </div>
      </section>

      {/* A REASON TO STAY — what that payment means on the farmer's end */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 88 }}>
        <Ornament label="The other end of the line" />
        <div style={{ height: 36 }} />
        <div
          ref={stay.ref as React.RefObject<HTMLDivElement>}
          className={`why-stage why-stay ${stay.inView ? "in" : ""}`}
        >
          <div className="col" style={{ gap: 14 }}>
            {/* the credit, pinging in on her phone */}
            <div className="card frame why-ping" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span className="eyebrow" style={{ color: "var(--moss)" }}>
                  UPI · credited
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 27,
                    color: "var(--moss)",
                  }}
                >
                  + ₹1,500
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
                sunita.devi@oksbi
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  marginTop: 4,
                }}
              >
                planting + 1 full year of care
              </div>
            </div>
            {/* who it reached */}
            <div
              className="card"
              style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}
            >
              <Placeholder
                label="Sunita"
                tone="terra"
                style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }}
                aspect={null}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                  Sunita Devi
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  Dhauladevi, Almora
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              the farmer&apos;s side
            </div>
            <h2 style={{ marginBottom: 16 }}>
              For Sunita-ji, this is <em>a reason to stay</em>.
            </h2>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              The same payment that plants your tree pays her to plant it — and
              to tend it through its first year. In the hills that matters more
              than it sounds: every year, people leave these villages for city
              work because the mountain doesn&apos;t pay. A tree that pays is a
              small argument for staying — and the people who stay are the ones
              who keep the springs and the soil alive.
            </p>
          </div>
        </div>
      </section>

      {/* THE PROOF — a real tree grows as you scroll */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <Ornament label="Step two · the proof" />
        <div style={{ height: 36 }} />
        <Reveal>
          <h2 style={{ maxWidth: 760, marginBottom: 8 }}>
            Then you watch it <em>grow</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p style={{ maxWidth: 600, color: "var(--ink-2)", fontSize: 16, marginBottom: 8 }}>
            Not a stock photo. Your tree, photographed by the farmer who tends
            it — scroll, and watch a year pass.
          </p>
        </Reveal>
        <ProofGrow />
      </section>

      {/* CLOSE — the promise + the next tap */}
      <section className="shell" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <Reveal>
          <div
            style={{
              background: "color-mix(in oklch, var(--moss-soft) 45%, var(--paper))",
              border: "1px solid var(--moss)",
              borderRadius: "var(--radius-lg)",
              padding: "clamp(36px, 8vw, 52px) clamp(22px, 6vw, 44px)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: 14 }}>
              You&apos;ll never have to <em>wonder</em> again.
            </h2>
            <p
              style={{
                maxWidth: 560,
                margin: "0 auto 26px",
                color: "var(--ink-2)",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              One farmer. One tree. One photo within a week, and twenty years of
              proof after it. That&apos;s the whole promise — and you can hold us
              to every word of it.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn moss" onClick={() => go("browse")}>
                Meet a farmer <span className="arrow">→</span>
              </button>
              <button className="btn ghost" onClick={() => router.push("/groves")}>
                See real donors&apos; groves
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
