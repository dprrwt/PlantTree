"use client";

import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import type { Plot } from "@/lib/data";

// ============================================================================
// PlotView — hand-crafted top-down view of a single plot.
// Deliberately NOT a satellite tile. Deterministic layout seeded from plot.id
// so the SVG is stable across renders.
// ============================================================================

export interface PlotViewProps {
  plot: Plot;
  height?: number;
  showLabels?: boolean;
}

export function PlotView({
  plot,
  height = 280,
  showLabels = true,
}: PlotViewProps) {
  // Seed once per plot id so render order doesn't matter.
  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < plot.id.length; i++) {
      h = (h * 31 + plot.id.charCodeAt(i)) >>> 0;
    }
    return h;
  }, [plot.id]);

  function rand(n: number): number {
    const s = (seed + n * 2654435761) >>> 0;
    return (s & 0xffff) / 0xffff;
  }

  const treeCount = Math.min(
    28,
    Math.max(8, Math.round((plot.treesAlive || 100) / 16)),
  );
  const trees = Array.from({ length: treeCount }, (_, i) => ({
    x: 12 + rand(i * 3) * 76,
    y: 18 + rand(i * 3 + 1) * 64,
    r: 1.4 + rand(i * 3 + 2) * 1.6,
  }));

  const pinX = 50 + (rand(99) - 0.5) * 8;
  const pinY = 50 + (rand(100) - 0.5) * 8;

  const slope = plot.slopeDeg || 20;
  const contourCurve = Math.min(35, Math.max(10, slope * 0.7));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        background:
          "linear-gradient(170deg, oklch(0.93 0.03 130) 0%, oklch(0.9 0.04 100) 60%, oklch(0.88 0.05 80) 100%)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern
            id={`forest-${plot.id}`}
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1.5"
              cy="1.5"
              r="0.4"
              fill="oklch(0.5 0.08 145)"
              opacity="0.5"
            />
          </pattern>
        </defs>

        {/* Surrounding forest hint (top corners) */}
        <path
          d={`M -5 -5 L 35 -5 Q 25 ${15 + rand(1) * 6} 18 ${28 + rand(2) * 8} L -5 ${30 + rand(3) * 6} Z`}
          fill={`url(#forest-${plot.id})`}
          opacity="0.7"
        />
        <path
          d={`M 105 -5 L 60 -5 Q 75 ${10 + rand(4) * 6} 88 ${24 + rand(5) * 6} L 105 ${20 + rand(6) * 4} Z`}
          fill={`url(#forest-${plot.id})`}
          opacity="0.6"
        />

        {/* Terrace contour lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = 30 + i * 12;
          const wave = contourCurve * 0.4;
          return (
            <path
              key={`c-${i}`}
              d={`M 5 ${y} Q 30 ${y - wave} 50 ${y} T 95 ${y}`}
              fill="none"
              stroke="oklch(0.55 0.04 70)"
              strokeWidth="0.4"
              strokeDasharray="1 1.5"
              opacity="0.6"
            />
          );
        })}

        {/* Plot boundary — hand-drawn dashed polygon */}
        <path
          d={`M 10 22
             Q ${30 + rand(11) * 6} ${18 + rand(12) * 4} ${52 + rand(13) * 6} ${20 + rand(14) * 4}
             L ${88 + rand(15) * 3} ${26 + rand(16) * 5}
             Q ${92 + rand(17) * 3} ${50 + rand(18) * 4} ${86 + rand(19) * 4} ${78 + rand(20) * 4}
             L ${15 + rand(21) * 5} ${82 + rand(22) * 4}
             Q ${6 + rand(23) * 3} ${55 + rand(24) * 4} 10 22 Z`}
          fill="oklch(0.86 0.06 130)"
          fillOpacity="0.35"
          stroke="oklch(0.42 0.085 145)"
          strokeWidth="0.6"
          strokeDasharray="2 1.5"
        />

        {/* Water source ripple */}
        {plot.waterSource && (
          <g transform={`translate(${8 + rand(30) * 6}, ${72 + rand(31) * 6})`}>
            <circle r="2" fill="oklch(0.7 0.08 220)" opacity="0.7" />
            <circle
              r="3.2"
              fill="none"
              stroke="oklch(0.7 0.08 220)"
              strokeWidth="0.3"
              opacity="0.4"
            />
          </g>
        )}

        {/* Tree dots */}
        {trees.map((t, i) => (
          <circle
            key={`t-${i}`}
            cx={t.x}
            cy={t.y}
            r={t.r}
            fill="oklch(0.45 0.08 145)"
            opacity={0.55 + rand(i * 7) * 0.4}
          />
        ))}
      </svg>

      {/* Pin marker */}
      <div
        style={{
          position: "absolute",
          left: `${pinX}%`,
          top: `${pinY}%`,
          transform: "translate(-50%, -100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "3px 8px",
            borderRadius: 4,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
            marginBottom: 2,
          }}
        >
          {plot.name}
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "5px solid var(--ink)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--terra)",
            border: "2px solid var(--paper)",
            boxShadow:
              "0 0 0 3px color-mix(in oklch, var(--terra) 25%, transparent), 0 2px 4px rgba(0,0,0,0.2)",
            marginTop: -2,
          }}
        />
      </div>

      {showLabels && (
        <>
          {/* Coords (top-right) */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "oklch(0.4 0.03 70)",
              letterSpacing: "0.04em",
              background:
                "color-mix(in oklch, var(--paper) 70%, transparent)",
              padding: "2px 6px",
              borderRadius: 3,
              border:
                "1px solid color-mix(in oklch, var(--ink) 12%, transparent)",
            }}
          >
            {plot.lat?.toFixed(3) ?? "—"}°N · {plot.lng?.toFixed(3) ?? "—"}°E
          </div>

          {/* Scale + elevation (bottom-left) */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "oklch(0.4 0.03 70)",
              letterSpacing: "0.04em",
            }}
          >
            <div
              style={{ height: 2, width: 30, background: "oklch(0.4 0.03 70)" }}
            />
            <span>~50m · {plot.elevationM}m elev</span>
          </div>

          {/* North arrow (bottom-right) */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "oklch(0.4 0.03 70)",
            }}
          >
            <span>N</span>
            <span style={{ marginTop: -2 }}>↑</span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// PlotCard — reusable plot summary card. Used on farmer profile, where page,
// and tree detail.
// ============================================================================

const TENURE_LABEL: Record<Plot["landTenure"], string> = {
  private: "Private · farmer-owned",
  "van-panchayat": "Van Panchayat · community forest",
  community: "Community-managed",
  lease: "Leased",
};

const STATUS_LABEL: Record<Plot["status"], string> = {
  planting: "planting",
  "field-visited": "field-visited",
  researching: "on the list",
};

const STATUS_COLOR: Record<Plot["status"], string> = {
  planting: "var(--moss)",
  "field-visited": "var(--terra)",
  researching: "var(--muted)",
};

export interface PlotCardProps {
  plot: Plot;
  compact?: boolean;
  onClick?: () => void;
}

export function PlotCard({ plot, compact = false, onClick }: PlotCardProps) {
  const tenureLabel = TENURE_LABEL[plot.landTenure] ?? plot.landTenure;
  const statusColor = STATUS_COLOR[plot.status];
  const statusLabel = STATUS_LABEL[plot.status];

  const cardProps: React.HTMLAttributes<HTMLDivElement> = onClick
    ? {
        onClick,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div
      {...cardProps}
      className="card frame"
      style={{
        padding: 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <PlotView plot={plot} height={compact ? 180 : 240} />
      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontStyle: "italic",
              }}
            >
              {plot.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.06em",
                marginTop: 2,
              }}
            >
              &ldquo;{plot.nameEn}&rdquo; · {plot.village}
            </div>
          </div>
          <span
            className="chip"
            style={{
              borderColor: statusColor,
              color: statusColor,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: statusColor,
                display: "inline-block",
                marginRight: 4,
              }}
            />
            {statusLabel}
          </span>
        </div>

        {!compact && plot.description && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              color: "var(--ink-2)",
              lineHeight: 1.55,
            }}
          >
            {plot.description}
          </p>
        )}

        <hr className="dotted-rule" style={{ margin: "14px 0" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <PlotStat value={`${plot.areaHa}`} unit="ha" label="area" />
          <PlotStat value={`${plot.elevationM}`} unit="m" label="elevation" />
          <PlotStat value={`${plot.slopeDeg}`} unit="°" label="slope" />
          <PlotStat
            value={`${plot.treesPlanted}`}
            unit={null}
            label="trees"
          />
        </div>

        {!compact && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {plot.waterSource && (
              <span
                className="tag"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span style={{ fontSize: 10 }} aria-hidden>
                  💧
                </span>
                {plot.waterSource}
              </span>
            )}
            <span className="tag">{tenureLabel}</span>
            {plot.panchayatVerified && (
              <span
                className="tag"
                style={{
                  color: "var(--moss)",
                  borderColor: "var(--moss)",
                }}
              >
                ✓ panchayat-verified
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlotStat({
  value,
  unit,
  label,
}: {
  value: ReactNode;
  unit: string | null;
  label: string;
}) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            {unit === "ha" ? " ha" : unit}
          </span>
        )}
      </div>
      <div className="stat-label" style={{ marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
