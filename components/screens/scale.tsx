"use client";

// Scale — how the model survives going from 1 tree to 1 crore.
// Static visitor manifesto: no data fetching, no auth, no DB. All copy lives
// in the arrays below verbatim (the founder's voice). Rendered inline in the
// SPA shell like the other visitor tabs; also reachable at /built-to-scale.

import React from "react";
import { useRouter } from "next/navigation";
import { Chip, Ornament, Stamp } from "@/components/shared";
import type { Screen } from "./types";

interface Phase {
  key: string;
  order: number;
  label: string;
  shortRange: string;
  range: string;
  where: string;
  farmers: string;
  ops: string;
  whatWorks: string;
  whatBreaks: string;
  whatWeBuild: { t: string; d: string }[];
  where_today?: boolean;
}

// The six phases of scale. Indian numbering throughout.
const PHASES: Phase[] = [
  {
    key: "pilot",
    order: 1,
    label: "Pilot",
    shortRange: "10²",
    range: "10 — 1,000 trees",
    where: "1 district",
    farmers: "5 – 30",
    ops: "1 person · the founder",
    whatWorks:
      "Eyeball verification. Every farmer met in person. Every plot walked. Every photo screened by the founder in the platform's own message threads.",
    whatBreaks:
      "Founder bottleneck. Burnout. Single-language. Can't sleep on Tuesdays.",
    whatWeBuild: [
      { t: "A directory.", d: "Not a platform. Each farmer's profile is a single page maintained by hand." },
      { t: "In-house donor↔farmer threads.", d: "Donors message their farmer directly on PlantTree — no phone numbers shared. The thread is the audit log." },
      { t: "A photo-proof standard.", d: "Sapling + wooden tag + tree number, visible. Failure to post by day 14 = refund." },
    ],
    where_today: true,
  },
  {
    key: "region",
    order: 2,
    label: "Region",
    shortRange: "10³",
    range: "1,000 — 10,000 trees",
    where: "1 state · 6–10 districts",
    farmers: "30 – 200",
    ops: "1 founder + 3–5 district leads",
    whatWorks:
      "Federated verification. Each district lead is a farmer-respected local who vets peers, owns a 200-tree cluster, and gets a small monthly stipend paid out of an op-fund (NOT donor money).",
    whatBreaks:
      "Spreadsheet chaos. Photo backlog. Farmer onboarding inconsistency. The founder's message inbox queues up.",
    whatWeBuild: [
      { t: "Farmer mobile app (PWA).", d: "Native language. Camera with auto-watermark. Photo uploads tagged with GPS + tree number, posted straight into the donor thread." },
      { t: "In-house messaging at scale.", d: "Templated planting briefs, status nudges, automatic 'photo received' confirmations — all on our own rails, with SMS/email fallback." },
      { t: "District-lead dashboard.", d: "Each lead sees their cluster: due photos, missing tags, replant flags. Owns the data." },
      { t: "Section 8 / Trust registration.", d: "Filed once we cross 1,000 verified trees and have ops to justify the paperwork." },
    ],
  },
  {
    key: "multistate",
    order: 3,
    label: "Multi-state",
    shortRange: "10⁴",
    range: "10,000 — 1 lakh trees",
    where: "3–5 states",
    farmers: "200 – 2,000",
    ops: "12-person core team + ~50 district leads",
    whatWorks:
      "State chapters with autonomy. Forest department MOUs in each state. FPO partnerships bring 100s of farmers at a time. 80G registration unlocks CSR rupees for ops.",
    whatBreaks:
      "Tone of voice drifts state-to-state. Quality variance in plots. Verification visits not scalable on foot.",
    whatWeBuild: [
      { t: "CV-assisted photo review.", d: "Auto-flag photos missing the tag, blurry, or geo-mismatched. Human still approves — model just queues priority." },
      { t: "Satellite NDVI cross-check.", d: "Yearly canopy delta per plot, sourced from open Sentinel-2 data. Catches abandoned plots without a site visit." },
      { t: "State playbook.", d: "Locked rules: native-only species lists, sapling cost bands, payment cadence, refund triggers. State leads can't override." },
      { t: "Open species + soil API.", d: "Public dataset matching elevation × rainfall × soil → recommended native species. Anyone can query it." },
    ],
  },
  {
    key: "national",
    order: 4,
    label: "National",
    shortRange: "10⁵",
    range: "1 lakh — 10 lakh trees",
    where: "All India",
    farmers: "2,000 – 25,000",
    ops: "40-person core + state chapters",
    whatWorks:
      "Each state runs its own ops on shared standards. Public tree registry as open data — every tree's number, plot, farmer, species, lat/long, planting date, latest photo. Donors come in via UPI International (NRIs) without us holding FX.",
    whatBreaks:
      "Funding for ops gets serious — district leads need real salaries. Linguistic + cultural variance compounds. Bad actors try to game the model.",
    whatWeBuild: [
      { t: "Operator funding model.", d: "Optional 'add ₹50 for the ops fund' checkbox at checkout. Separate ledger, audited quarterly. Never mixed with farmer payment." },
      { t: "10-language farmer interface.", d: "Hindi, Marathi, Tamil, Telugu, Kannada, Bangla, Gujarati, Punjabi, Malayalam, Odia. Voice-first for low-literacy users." },
      { t: "Public tree registry.", d: "Open, downloadable, queryable. Like a property record — every tree has a permanent ID and a public page." },
      { t: "Insurance pool for replants.", d: "1% of every payment (with explicit donor opt-in) goes into a state-level fund for re-plantings beyond year 1." },
    ],
  },
  {
    key: "subcontinent",
    order: 5,
    label: "Subcontinent",
    shortRange: "10⁶",
    range: "10 lakh — 1 crore trees",
    where: "India + Nepal + Bhutan + Bangladesh + Sri Lanka",
    farmers: "25,000 – 1.5 lakh",
    ops: "Federated non-profit utility",
    whatWorks:
      "We stop being a website and start being public infrastructure — a non-profit utility, like UPI itself. Other NGOs, school programs, government schemes, and CSR teams all plant on our rails because they're the most boring, audited, undeniable rails available.",
    whatBreaks:
      "Greenwashing risk: someone tries to mint dubious carbon credits on top of the registry. Political capture risk in some states. The brand has to stay stubbornly small even as the impact gets large.",
    whatWeBuild: [
      { t: "Open planting API.", d: "Any organization can register a tree, pay a farmer, hand off verification to our standard. Free. No commercial license. Source-available." },
      { t: "Carbon-credit firewall.", d: "Registry stays free + public. Credits are issued only with explicit farmer consent + farmer share. Most plots opt out — and that's fine." },
      { t: "Cross-border UPI rails.", d: "Same direct-payment model in NPR / BDT / BTN / LKR currency corridors as they open up to UPI." },
      { t: "Independent audit body.", d: "Annual third-party audit of every state chapter's books, plots, and refund record. Published in full." },
    ],
  },
  {
    key: "horizon",
    order: 6,
    label: "Beyond",
    shortRange: "10⁷⁺",
    range: "1 crore +",
    where: "Asia · Africa · Latin America",
    farmers: "1.5 lakh +",
    ops: "Mostly local, federated",
    whatWorks:
      "The thing we built becomes uninteresting infrastructure — like postal codes. India proved a direct-payment registry model could plant 1 crore trees with one-zero-zero percent passthrough. Other countries fork the protocol, run their own chapters, share the registry standard.",
    whatBreaks:
      "Honestly, by here the protocol has to be more robust than the organisation. If PlantTree.life-the-NGO dies, the registry, the standards, and the farmer relationships must keep working.",
    whatWeBuild: [
      { t: "The protocol, not the platform.", d: "Open spec for direct-pay, photo-proof tree registries. Independent national chapters. We're one implementation of many." },
      { t: "A boring foundation.", d: "Long-tenured stewardship. No founder cult. No exits. Like the IETF or Wikimedia, but for trees." },
    ],
  },
];

// The five immutable principles.
const INVARIANTS = [
  { n: "01", t: "100% direct payment", d: "UPI rails — and their analogues elsewhere — already handle ₹100 lakh crore a year. The direct-pay model scales infinitely; only ops scales linearly with us." },
  { n: "02", t: "One photo, one tree, one number", d: "Each tree carries a permanent ID and a public page from planting day to year 20. The proof unit never changes — just how we collect and verify it." },
  { n: "03", t: "Native species only", d: "No eucalyptus, no chir pine in new plantings, anywhere, ever. The species list is set by local foresters per district — but the rule is global." },
  { n: "04", t: "Public failures", d: "Dead trees are marked dead. Refunds are listed. Bad-actor farmers are named when removed. Transparency compounds — opacity rots." },
  { n: "05", t: "The farmer is not our employee", d: "Independent relationship. We make the introduction, we hold the standard, we drop them if they fail. We never own the trees or the land." },
];

// The four scaling levers (separate dials).
const LEVERS = [
  {
    title: "People",
    tag: "Federation, not hiring",
    tone: "var(--moss)",
    progression: ["Founder verifies", "District leads", "State chapters", "Federated chapters", "Open protocol"],
    principle: "We never employ farmers. We slowly devolve verification authority from one person → small clusters → state-level peers → independent chapters → an open standard anyone can run.",
  },
  {
    title: "Tech",
    tag: "Automate verification, never trust",
    tone: "var(--terra)",
    progression: ["Eyeball + spreadsheet", "Farmer PWA", "CV photo triage", "Satellite NDVI", "Open registry API"],
    principle: "Tech does the boring stuff — flag suspicious photos, cross-check canopy growth from space, generate planting briefs. Humans approve every decision that affects a farmer's payment.",
  },
  {
    title: "Money",
    tag: "Op funding, never farmer skim",
    tone: "var(--ink)",
    progression: ["Founder's pocket", "Small grants", "Opt-in ops fund", "CSR + 80G", "Audited utility"],
    principle: "The donor's ₹500 always goes 100% to the farmer. Ops are funded from a separate ledger — grants, opt-in tips, CSR — that grows on a different axis from the planting volume.",
  },
  {
    title: "Trust",
    tag: "Show the work, always",
    tone: "var(--moss-2)",
    progression: ["Per-tree pages", "Public refund log", "Open data exports", "Tree registry API", "External audits"],
    principle: "The platform is opaque to no one. Every tree, every payment, every refund is on a public page that doesn't require login to view. The audit is the brand.",
  },
];

// What breaks at each scale jump.
const BREAKS = [
  { from: "100", to: "1,000", what: "In-person verification breaks", how: "Founder can't visit 1,000 plots. Solution: district leads as verifying peers, paid out of separate ops fund." },
  { from: "1,000", to: "10,000", what: "Single-inbox ops breaks", how: "One founder inbox can't carry 10k tree events. Solution: in-house messaging at scale + farmer PWA + district-lead dashboards." },
  { from: "10,000", to: "1 lakh", what: "Single-language platform breaks", how: "We can't run Tamil + Bangla + Marathi farmers off a Hindi-English site. Solution: 10-language farmer interface + voice-first UX." },
  { from: "1 lakh", to: "10 lakh", what: "Ad-hoc ops funding breaks", how: "District leads need real salaries; founder's pocket is empty. Solution: 80G + CSR + opt-in donor tips, fully separated from farmer payment." },
  { from: "10 lakh", to: "1 crore", what: "Single-organisation governance breaks", how: "No one NGO should hold a registry of 1 crore trees. Solution: federated state chapters + an open protocol others can implement." },
];

const SCALES_NATURALLY: [string, string][] = [
  ["UPI rails", "Handles ~₹100 lakh crore / year. Cost per transaction: ₹0. No re-design needed for any volume we'll ever hit."],
  ["SMS + email (transactional)", "Notification fallback for in-house messages at ~₹0.12/SMS. Survives billions."],
  ["Sentinel-2 + Landsat", "Free, public satellite imagery on a 5-day refresh. NDVI is well-understood."],
  ["Aadhaar / DigiLocker", "Farmer KYC at population scale. We tap, we don't build."],
  ["The directory model itself", "A static per-tree page is just HTML — cacheable, indexable, archivable, costs ~₹0/year/tree."],
];

const HAS_TO_BE_REDESIGNED: [string, string][] = [
  ["Verification authority", "Today: founder eyeballs every photo. Tomorrow: federated peer-verification with CV + satellite triage."],
  ["Operator funding", "Today: founder's pocket. Tomorrow: audited ops ledger, opt-in tips + CSR — never mixed with farmer payment."],
  ["Onboarding new farmers", "Today: a coffee at the chai shop. Tomorrow: FPO bulk onboarding + voice-first PWA in 10 languages."],
  ["Plot ecology screening", "Today: a forester walks the plot. Tomorrow: open species API (elevation × rainfall × soil → recommended species) reviewed by humans."],
  ["Governance", "Today: founder + 3 friends. Tomorrow: independent state chapters + external audit + an open protocol that outlives any one org."],
];

const OPS_STACK = [
  { t: "Farmer PWA", d: "10 languages, voice-first, offline-first" },
  { t: "Donor app", d: "Browse · pay direct · track 20 yrs" },
  { t: "District-lead dashboard", d: "Cluster ops, replant flags" },
  { t: "Public tree registry", d: "Every tree, queryable, downloadable" },
  { t: "Audit & refund ledger", d: "Live, public, third-party reviewed" },
];

const MOATS = [
  { n: "01", t: "Trust capital", d: "Every public photo, every public refund, every named-and-removed farmer adds to a stack that competitors can't buy. By 1 lakh trees, the brand is the audit." },
  { n: "02", t: "Species & plot data", d: "By 10 lakh trees we have the most granular planting registry in India — elevation × rainfall × soil × species × year-1 survival. Open data, useful to everyone, owned by no one." },
  { n: "03", t: "Farmer network", d: "FPOs and panchayats start coming to us. The directory effect: more verified farmers → easier donor choice → more payments → more farmers worth verifying." },
  { n: "04", t: "Forest dept relationships", d: "Each state MOU lowers the cost of the next state's MOU. By national phase, planting on degraded community land is procedurally easy across India." },
  { n: "05", t: "Diaspora rupees", d: "UPI International + 80G means an NRI in Toronto can send ₹500 to a farmer in Almora with the same friction as a domestic donor. That base scales to lakhs of donors." },
  { n: "06", t: "Time itself", d: "A tree paid for in 2026 is more valuable in 2046. Our incentive structure rewards survival, not planting volume. The further out we go, the more our work has compounded." },
];

export function Scale({ navigate }: { navigate?: (s: Screen) => void }) {
  const router = useRouter();
  // In the SPA shell we get `navigate`; on the standalone /built-to-scale route
  // there's no SPA, so map screens to real URLs.
  const go = (s: Screen) =>
    navigate ? navigate(s) : router.push(s === "browse" ? "/" : "/how");

  return (
    <div data-screen-label="07 Scale">
      {/* HERO */}
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div className="scale-hero">
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
              <Stamp color="var(--moss)" rotation={-3}>built to scale</Stamp>
              <Chip>10² → 10⁷ trees</Chip>
              <Chip tone="terra">a scaling thesis</Chip>
            </div>
            <h1 style={{ marginBottom: 28 }}>
              From <em>one</em> tree<br />
              to <em className="squiggle">one&nbsp;crore</em>.<br />
              Designed for both.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 560 }}>
              The hard part of a model like ours isn&apos;t the first hundred trees — it&apos;s making
              sure the ten-millionth tree gets the same honest treatment. Here&apos;s what stays the
              same forever, what we have to redesign at every order of magnitude, and what we expect
              to <em>break</em> along the way.
            </p>
            <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn moss"
                onClick={() => {
                  document
                    .getElementById("ladder")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Skip to the ladder <span className="arrow">↓</span>
              </button>
              <button className="btn ghost" onClick={() => go("how")}>
                How it works today
              </button>
            </div>
          </div>

          {/* Hero panel: tiny scale ladder preview */}
          <div className="card frame" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>The whole thesis, in 30 seconds</div>
            <div className="col" style={{ gap: 14 }}>
              {PHASES.map((p) => (
                <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 14, opacity: p.order === 1 ? 1 : 0.85 }}>
                  <div style={{ width: 36, textAlign: "right", fontFamily: "var(--font-display)", fontSize: 20, color: p.where_today ? "var(--moss)" : "var(--ink-2)" }}>
                    {p.shortRange}
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.where_today ? "var(--moss)" : "var(--line-2)", boxShadow: p.where_today ? "0 0 0 4px color-mix(in oklch, var(--moss) 22%, transparent)" : "none", flexShrink: 0 }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                      {p.label}
                      {p.where_today && (
                        <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--moss)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          · we are here
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE INVARIANTS */}
      <section className="shell" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <Ornament label="What never changes" />
        <div style={{ height: 28 }}></div>
        <div className="scale-split">
          <div>
            <h2 style={{ marginBottom: 16 }}>
              Five<br />
              <em>immutable</em>
              <br />
              principles.
            </h2>
            <p style={{ color: "var(--ink-2)", maxWidth: 360 }}>
              The whole scaling argument rests on these. If any of them break under pressure, the
              thing we built isn&apos;t worth scaling. Each is written so a district lead in 2032 can
              hold us to it.
            </p>
          </div>
          <div className="col" style={{ gap: 0 }}>
            {INVARIANTS.map((inv, i) => (
              <div key={inv.n} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 24, padding: "22px 0", borderTop: i === 0 ? "none" : "1px dotted var(--line-2)", alignItems: "start" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 1, color: "var(--moss)" }}>{inv.n}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 6 }}>{inv.t}</div>
                  <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.55 }}>{inv.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE LADDER */}
      <section id="ladder" className="shell" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Ornament label="The scaling ladder · six phases" />
        <div style={{ height: 32 }}></div>

        <div style={{ position: "relative" }}>
          {/* spine */}
          <div className="scale-spine"></div>

          <div className="col" style={{ gap: 32 }}>
            {PHASES.map((p) => (
              <div key={p.key} style={{ position: "relative" }}>
                {/* Marker */}
                <div
                  className="scale-marker"
                  style={{
                    background: p.where_today ? "var(--moss)" : "var(--paper)",
                    border: `2.5px solid ${p.where_today ? "var(--moss)" : "var(--ink)"}`,
                    color: p.where_today ? "var(--paper)" : "var(--ink)",
                    boxShadow: p.where_today ? "0 0 0 6px color-mix(in oklch, var(--moss) 20%, transparent)" : "none",
                  }}
                >
                  {p.order}
                </div>

                <div className="scale-phase-body">
                  <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Top band */}
                    <div
                      className="scale-band"
                      style={{
                        background: p.where_today
                          ? "color-mix(in oklch, var(--moss-soft) 60%, var(--paper))"
                          : p.order >= 5
                            ? "color-mix(in oklch, var(--terra-soft) 25%, var(--paper))"
                            : "var(--paper-2)",
                        borderBottom: "1px dashed var(--line-2)",
                      }}
                    >
                      <div>
                        <div className="eyebrow" style={{ marginBottom: 4 }}>Phase {p.order} · {p.shortRange} trees</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.1 }}>
                          {p.label}
                          {p.where_today && (
                            <span style={{ marginLeft: 12 }}>
                              <Stamp color="var(--moss)" rotation={-2}>we are here</Stamp>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {[
                          ["range", p.range],
                          ["where", p.where],
                          ["farmers", p.farmers],
                          ["ops shape", p.ops],
                        ].map(([label, val], idx) => (
                          <React.Fragment key={label}>
                            {idx > 0 && <div style={{ width: 1, height: 36, background: "var(--line)" }}></div>}
                            <div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{val}</div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Body grid */}
                    <div className="scale-phase-cols">
                      <div className="scale-phase-col-left" style={{ padding: "24px 28px" }}>
                        <div className="eyebrow" style={{ marginBottom: 10, color: "var(--moss)" }}>What works at this scale</div>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{p.whatWorks}</p>
                        <hr className="dotted-rule" style={{ margin: "18px 0" }} />
                        <div className="eyebrow" style={{ marginBottom: 10, color: "var(--terra)" }}>What breaks at this scale</div>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{p.whatBreaks || "—"}</p>
                      </div>
                      <div style={{ padding: "24px 28px", background: "color-mix(in oklch, var(--paper-2) 60%, var(--paper))" }}>
                        <div className="eyebrow" style={{ marginBottom: 14 }}>What we build to get through</div>
                        <div className="col" style={{ gap: 12 }}>
                          {p.whatWeBuild.map((b, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 12, alignItems: "baseline" }}>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>{String(i + 1).padStart(2, "0")}</div>
                              <div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, marginBottom: 2 }}>{b.t}</div>
                                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{b.d}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT BREAKS — the jumps */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <Ornament label="What breaks at each jump · honest" />
        <div style={{ height: 28 }}></div>
        <div className="scale-split">
          <div>
            <h2 style={{ marginBottom: 16 }}>
              The hard part isn&apos;t <em>growing</em>.<br />
              It&apos;s <em>not breaking</em>.
            </h2>
            <p style={{ color: "var(--ink-2)", maxWidth: 400 }}>
              Every order-of-magnitude jump kills something that worked before. Naming the failure
              ahead of time is the only way to design for it. None of these are surprises — they&apos;re
              scheduled.
            </p>
          </div>
          <div className="col" style={{ gap: 0 }}>
            <div className="list-row head" style={{ gridTemplateColumns: "70px 90px 1.2fr 1.5fr", borderBottom: "1px solid var(--line-2)" }}>
              <div>from</div>
              <div>to</div>
              <div>what breaks</div>
              <div>the redesign</div>
            </div>
            {BREAKS.map((b, i) => (
              <div key={i} className="list-row" style={{ gridTemplateColumns: "70px 90px 1.2fr 1.5fr", alignItems: "start", padding: "18px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink-2)" }}>{b.from}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
                  <span style={{ color: "var(--muted)", marginRight: 6 }}>→</span>
                  {b.to}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--terra)" }}>{b.what}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{b.how}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR LEVERS */}
      <section className="shell" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <Ornament label="Four independent levers" />
        <div style={{ height: 28 }}></div>
        <div style={{ marginBottom: 28, maxWidth: 640 }}>
          <p style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.6 }}>
            Scaling isn&apos;t one dial. It&apos;s four — each on its own clock, each with its own
            failure mode. We move <em>People</em> from founder-verified to federated-protocol. We move{" "}
            <em>Tech</em> from spreadsheet to satellite. We move <em>Money</em> from pocket-funded to
            audited utility. We move <em>Trust</em> from individual pages to an open registry. None of
            them can lag too far behind the others.
          </p>
        </div>
        <div className="grid-4">
          {LEVERS.map((l) => (
            <div key={l.title} className="card frame" style={{ padding: 22, borderTop: `3px solid ${l.tone}` }}>
              <div className="eyebrow" style={{ marginBottom: 8, color: l.tone }}>{l.tag}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, marginBottom: 10 }}>{l.title}</div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 18 }}>{l.principle}</p>
              <div className="eyebrow" style={{ marginBottom: 10 }}>The progression</div>
              <div className="col" style={{ gap: 0, position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 10, bottom: 10, width: 2, background: "var(--line-2)" }}></div>
                {l.progression.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", position: "relative" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: i === 0 ? l.tone : "var(--paper)", border: `2px solid ${l.tone}`, flexShrink: 0, zIndex: 1 }}></div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", fontFamily: i === 0 ? "var(--font-display)" : "var(--font-body)", fontStyle: i === 0 ? "italic" : "normal" }}>
                      {step}
                      {i === 0 && (
                        <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--moss)", letterSpacing: "0.1em", textTransform: "uppercase" }}>today</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCALES NATURALLY vs HAS TO BE REDESIGNED */}
      <section className="shell" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <Ornament label="What scales by itself vs what we have to redesign" />
        <div style={{ height: 28 }}></div>
        <div className="grid-2">
          <div className="card" style={{ background: "color-mix(in oklch, var(--moss-soft) 35%, var(--paper))", border: "1px solid color-mix(in oklch, var(--moss) 30%, var(--line))", padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 12, color: "var(--moss)" }}>Scales naturally · already good for 10⁷</div>
            <h3 style={{ marginBottom: 16 }}>The infrastructure we sit on.</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {SCALES_NATURALLY.map(([t, d]) => (
                <li key={t} style={{ padding: "12px 0", borderBottom: "1px dotted color-mix(in oklch, var(--moss) 30%, var(--line))" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10, alignItems: "baseline" }}>
                    <span style={{ color: "var(--moss)" }}>✓</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{t}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{d}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ background: "color-mix(in oklch, var(--terra-soft) 25%, var(--paper))", border: "1px solid color-mix(in oklch, var(--terra) 25%, var(--line))", padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 12, color: "var(--terra)" }}>Has to be redesigned · the work</div>
            <h3 style={{ marginBottom: 16 }}>The parts we own and rebuild.</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {HAS_TO_BE_REDESIGNED.map(([t, d]) => (
                <li key={t} style={{ padding: "12px 0", borderBottom: "1px dotted color-mix(in oklch, var(--terra) 25%, var(--line))" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10, alignItems: "baseline" }}>
                    <span style={{ color: "var(--terra)" }}>↻</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{t}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{d}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM */}
      <section className="shell" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <Ornament label="The architecture, at 1 crore trees" />
        <div style={{ height: 28 }}></div>
        <div className="card frame" style={{ padding: 32 }}>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {/* Layer 1 */}
            <div className="card" style={{ background: "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))", padding: 18, borderLeft: "3px solid var(--moss)" }}>
              <div className="eyebrow" style={{ marginBottom: 8, color: "var(--moss)" }}>Layer 1 · the rails</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>Public infrastructure</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                UPI · Aadhaar · Sentinel-2 NDVI · SMS/email · GST · Bharat Nidhi. Plumbing we never
                have to build or maintain.
              </div>
            </div>
            <div className="card" style={{ background: "color-mix(in oklch, var(--terra-soft) 30%, var(--paper))", padding: 18, borderLeft: "3px solid var(--terra)" }}>
              <div className="eyebrow" style={{ marginBottom: 8, color: "var(--terra)" }}>Layer 2 · the protocol</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>The PlantTree spec</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                Open, source-available standard for: tree IDs · photo-proof format · refund rules ·
                species lookup · farmer registry. Anyone can implement.
              </div>
            </div>
            <div className="card" style={{ background: "var(--paper-2)", padding: 18, borderLeft: "3px solid var(--ink)" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Layer 3 · the chapters</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>State implementations</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                Uttarakhand, Tamil Nadu, Karnataka, Maharashtra, Odisha … each runs autonomously on
                the protocol. Independent boards. Shared standards.
              </div>
            </div>
          </div>

          {/* Down arrow */}
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 12 }}>↓ implements ↓</div>

          {/* Operational stack */}
          <div className="scale-ops-stack" style={{ marginBottom: 24 }}>
            {OPS_STACK.map((s) => (
              <div key={s.t} className="card" style={{ background: "var(--paper)", padding: 14 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, marginBottom: 4 }}>{s.t}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>{s.d}</div>
              </div>
            ))}
          </div>

          {/* Down arrow */}
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 12 }}>↓ serves ↓</div>

          {/* The people */}
          <div className="grid-3">
            <div className="card" style={{ background: "color-mix(in oklch, var(--moss-soft) 25%, var(--paper))", padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>1.5 lakh</div>
              <div className="stat-label" style={{ marginTop: 4 }}>farmers planting</div>
            </div>
            <div className="card" style={{ background: "color-mix(in oklch, var(--terra-soft) 25%, var(--paper))", padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>~50 lakh</div>
              <div className="stat-label" style={{ marginTop: 4 }}>donors over the decade</div>
            </div>
            <div className="card" style={{ background: "var(--paper-2)", padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>1 crore</div>
              <div className="stat-label" style={{ marginTop: 4 }}>trees with a permanent page</div>
            </div>
          </div>

          {/* Closing note */}
          <div style={{ marginTop: 28, padding: 18, background: "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))", borderRadius: 10, borderLeft: "3px solid var(--moss)" }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>The point of the architecture</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>
              The protocol is more important than the platform. If PlantTree.life-the-org dies, the
              registry, the standards, the farmer relationships, and the public pages all keep working
              — because no one part holds the whole. That&apos;s the only way an org promising{" "}
              <em>twenty years of growth updates </em>can credibly promise twenty years.
            </p>
          </div>
        </div>
      </section>

      {/* COMPOUNDING MOATS */}
      <section className="shell" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <Ornament label="What compounds — the long game" />
        <div style={{ height: 28 }}></div>
        <div className="grid-3">
          {MOATS.map((m) => (
            <div key={m.n} className="card frame" style={{ padding: 22 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>moat {m.n}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 10 }}>{m.t}</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{m.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell" style={{ paddingBottom: 80 }}>
        <div className="scale-cta" style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-lg)", padding: "44px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, borderRadius: "50%", background: "color-mix(in oklch, var(--moss) 60%, transparent)", filter: "blur(50px)", opacity: 0.5 }}></div>
          <div style={{ position: "relative" }}>
            <h2 style={{ marginBottom: 14 }}>
              At <em>96 trees</em>, this looks like<br />
              one person&apos;s project.<br />
              At <em>1 crore</em>, like infrastructure.
            </h2>
            <p style={{ color: "color-mix(in oklch, var(--paper) 70%, transparent)", maxWidth: 520, marginBottom: 22 }}>
              Both are intentional. The first hundred prove the unit economics. The next ten million
              prove the protocol. Neither is the goal on its own — both are the same idea, designed at
              very different scales.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn" style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }} onClick={() => go("browse")}>
                Plant tree #97 <span className="arrow">→</span>
              </button>
              <button className="btn ghost" style={{ color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 40%, transparent)" }} onClick={() => go("how")}>
                How it works today
              </button>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div className="card" style={{ background: "color-mix(in oklch, var(--paper) 8%, transparent)", borderColor: "color-mix(in oklch, var(--paper) 25%, transparent)", color: "var(--paper)", padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 14, color: "color-mix(in oklch, var(--paper) 60%, transparent)" }}>The whole thesis</div>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: "color-mix(in oklch, var(--paper) 88%, transparent)" }}>
                <li>Five invariants that never change.</li>
                <li>Six phases, each redesigning ops.</li>
                <li>Four levers, on their own clocks.</li>
                <li>One open protocol — bigger than us.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
