// FarmerVerifiedCard — visitor-facing trust credential.
// Compact on-page summary of a farmer's Charter, shown on the public farmer
// profile (Farmers → click a farmer). Derives the three verification checks,
// land tenure, track record and survival % from the farmer record + their
// plots, so it works for any farmer with no per-farmer markup.
//
// "Read the full charter →" opens the printable, bilingual charter document
// (rendered server-side at /charter/[farmerId]) in a new tab.

import { Placeholder } from "@/components/shared";
import type { Farmer, LandTenure, Plot } from "@/lib/data";

const TENURE_LABEL: Record<LandTenure, string> = {
  private: "Private plot",
  "van-panchayat": "Van Panchayat",
  community: "Community grove",
  lease: "Leased",
};

export function FarmerVerifiedCard({
  farmer,
  plots,
  charterHref,
}: {
  farmer: Farmer;
  plots: Plot[];
  charterHref?: string;
}) {
  const href = charterHref ?? `/charter/${farmer.id}`;
  const tenureVerified = plots.some((p) => p.panchayatVerified);
  const tenureKinds = Array.from(new Set(plots.map((p) => p.landTenure)));
  const tenureLabel =
    tenureKinds.map((k) => TENURE_LABEL[k] ?? k).join(" + ") || "On file";
  const survival = farmer.treesPlanted
    ? Math.round((farmer.treesAlive / farmer.treesPlanted) * 100)
    : null;
  const initial = farmer.name.trim().charAt(0);

  const checks = [
    { t: "Government ID verified", by: `in person by ${farmer.verifiedBy}` },
    {
      t: "Land tenure confirmed",
      by: tenureVerified
        ? `${tenureLabel} · panchayat resolution on file`
        : tenureLabel,
    },
    {
      t: "Paid directly to her own bank",
      by: `UPI ${farmer.upi} · no commission`,
    },
  ];
  const stats = [
    { n: `${farmer.years} yrs`, l: "planting" },
    { n: String(farmer.treesPlanted), l: "planted" },
    { n: String(farmer.treesAlive), l: "alive" },
    { n: survival != null ? `${survival}%` : "—", l: "survival" },
  ];

  return (
    <div className="card frame" style={{ padding: 0, overflow: "hidden" }}>
      {/* header band */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 20px 14px",
          borderBottom: "1.5px dotted var(--line-2)",
        }}
      >
        {/* TODO[claude-code]: swap this Placeholder for the farmer's real verified photo */}
        <Placeholder
          label={initial}
          tone={farmer.photoTone === "neutral" ? "neutral" : farmer.photoTone}
          style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0 }}
          aspect={null}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            {farmer.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            {farmer.village} · charter signed
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--moss)",
            color: "var(--paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 11px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "var(--paper)",
              color: "var(--moss)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          Verified planter
        </span>
      </div>

      {/* checks */}
      <div style={{ padding: "14px 20px 4px", display: "grid", gap: 9 }}>
        {checks.map((c, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "18px 1fr",
              gap: 11,
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "1.5px solid var(--moss)",
                color: "var(--moss)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                marginTop: 1,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.35 }}>
              <strong style={{ fontWeight: 600 }}>{c.t}</strong>{" "}
              <span style={{ color: "var(--muted)", fontSize: 12 }}>
                — {c.by}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* track record */}
      <div
        style={{
          margin: "14px 20px 0",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          padding: "13px 14px",
          borderRadius: 10,
          background: "color-mix(in oklch, var(--moss-soft) 22%, var(--paper))",
          border: "1px solid color-mix(in oklch, var(--moss) 22%, var(--line))",
        }}
      >
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {s.n}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* pledge teaser */}
      <div
        style={{
          margin: "16px 20px 0",
          borderLeft: "2px solid var(--terra)",
          paddingLeft: 14,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.4,
          color: "var(--ink-2)",
        }}
      >
        &quot;I will report honestly — if a tree dies, I will say so.&quot;
      </div>

      {/* footer */}
      <div
        style={{
          marginTop: 16,
          padding: "14px 20px 18px",
          borderTop: "1.5px dotted var(--line-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Signed &amp; sealed
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 17,
              letterSpacing: 0,
              textTransform: "none",
              color: "var(--ink)",
            }}
          >
            {farmer.name}
          </span>
        </div>
        <a
          className="btn ghost sm"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          Read the full charter <span className="arrow">→</span>
        </a>
      </div>
    </div>
  );
}
