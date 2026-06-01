"use client";

import React, { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

// ---------- Logo wordmark ----------
export function Logo({ small }: { small?: boolean }) {
  return (
    <div className="brand">
      <span className="dot"></span>
      <span style={{ fontSize: small ? 18 : 22 }}>PlantTree</span>
      <span className="tld">.life</span>
    </div>
  );
}

// ---------- Striped placeholder ----------
export interface PlaceholderProps {
  label: string;
  tone?: "neutral" | "moss" | "terra";
  height?: number | string;
  aspect?: string | null;
  rounded?: string;
  style?: CSSProperties;
}

export function Placeholder({
  label,
  tone = "neutral",
  height,
  aspect = "4/3",
  rounded = "var(--radius-sm)",
  style,
}: PlaceholderProps) {
  const cls =
    tone === "moss"
      ? "placeholder-img moss"
      : tone === "terra"
        ? "placeholder-img terra"
        : "placeholder-img";
  return (
    <div
      className={cls}
      style={{
        aspectRatio: height ? undefined : aspect ?? undefined,
        height,
        borderRadius: rounded,
        ...style,
      }}
    >
      <span className="label">{label}</span>
    </div>
  );
}

// ---------- Stamp ----------
export interface StampProps {
  children: ReactNode;
  color?: string;
  rotation?: number;
  style?: CSSProperties;
}

export function Stamp({
  children,
  color = "var(--terra)",
  rotation = -3,
  style,
}: StampProps) {
  return (
    <span
      className="stamp"
      style={{
        borderColor: color,
        color,
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ---------- Chip ----------
export interface ChipProps {
  children: ReactNode;
  tone?: string;
  style?: CSSProperties;
}

export function Chip({ children, tone, style }: ChipProps) {
  return (
    <span className={`chip ${tone || ""}`} style={style}>
      <span className="dot"></span>
      {children}
    </span>
  );
}

// ---------- TreeViz ----------
export interface TreeVizProps {
  stage?: 0 | 1 | 2 | 3 | 4;
  label?: string;
  height?: number | string;
}

export function TreeViz({ stage = 2, label, height = 320 }: TreeVizProps) {
  const trunkW = 4 + stage * 2.2;
  const trunkH = 8 + stage * 28;
  const canopyR = stage === 0 ? 0 : 12 + stage * 18;
  const cy = 210 - trunkH - canopyR * 0.55;
  return (
    <div className="tree-viz" style={{ height }}>
      <div className="grid-marks"></div>
      <div className="ground"></div>
      <svg
        viewBox="0 0 200 240"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <circle cx="160" cy="36" r="14" fill="oklch(0.86 0.1 80)" opacity="0.6" />
        {stage > 0 && (
          <rect
            x={100 - trunkW / 2}
            y={210 - trunkH}
            width={trunkW}
            height={trunkH}
            rx={trunkW / 2}
            fill="oklch(0.42 0.05 50)"
          />
        )}
        {stage > 1 && (
          <g stroke="oklch(0.42 0.05 50)" strokeWidth="1.5" fill="none" opacity="0.55">
            <path d="M100 212 Q 92 218, 86 224" />
            <path d="M100 212 Q 108 218, 114 224" />
          </g>
        )}
        {stage === 0 && (
          <g>
            <ellipse cx="100" cy="208" rx="14" ry="5" fill="oklch(0.42 0.06 50)" opacity="0.5" />
            <circle cx="100" cy="206" r="3" fill="oklch(0.42 0.05 50)" />
          </g>
        )}
        {stage === 1 && (
          <g>
            <path
              d="M100 200 Q 92 192, 88 184 Q 96 184, 100 198 Z"
              fill="oklch(0.55 0.1 145)"
            />
            <path
              d="M100 200 Q 108 192, 112 184 Q 104 184, 100 198 Z"
              fill="oklch(0.5 0.1 140)"
            />
          </g>
        )}
        {stage >= 2 && (
          <g>
            <circle cx="100" cy={cy + 6} r={canopyR} fill="oklch(0.5 0.085 142)" />
            <circle
              cx={100 - canopyR * 0.5}
              cy={cy + 4}
              r={canopyR * 0.7}
              fill="oklch(0.55 0.08 145)"
            />
            <circle
              cx={100 + canopyR * 0.5}
              cy={cy + 4}
              r={canopyR * 0.7}
              fill="oklch(0.46 0.085 140)"
            />
            <circle
              cx={100}
              cy={cy - canopyR * 0.3}
              r={canopyR * 0.75}
              fill="oklch(0.58 0.08 148)"
            />
          </g>
        )}
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ---------- MiniBars ----------
export interface MiniBar {
  v: number;
  l: string;
}

export function MiniBars({
  data,
  color = "var(--moss)",
}: {
  data: MiniBar[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${(d.v / max) * 100}%`,
              background: color,
              borderRadius: "3px 3px 0 0",
              minHeight: 3,
            }}
          ></div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--muted)",
            }}
          >
            {d.l}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- UttarakhandMap ----------
export interface MapPin {
  id: string;
  x: number;
  y: number;
  name: string;
  elevation?: string;
}

export interface UttarakhandMapProps {
  pins?: MapPin[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
  compact?: boolean;
  className?: string;
}

export function UttarakhandMap({
  pins = [],
  selected,
  onSelect,
  height = 380,
  compact,
  className,
}: UttarakhandMapProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height,
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 800 500"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern id="uk-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="oklch(0.6 0.02 70)"
              strokeWidth="0.4"
              opacity="0.25"
            />
          </pattern>
          <pattern id="uk-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1" fill="oklch(0.55 0.06 145)" opacity="0.5" />
          </pattern>
          <linearGradient id="uk-mountains" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.02 220)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.92 0.02 80)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="800" height="500" fill="url(#uk-grid)" />

        <path
          d="M 60 30 L 760 30 L 760 180 Q 600 120, 480 100 Q 320 110, 180 160 Q 100 180, 60 200 Z"
          fill="url(#uk-mountains)"
          opacity="0.7"
        />
        <g stroke="oklch(0.5 0.03 220)" strokeWidth="0.8" fill="none" opacity="0.45">
          <path d="M 80 130 L 180 70 L 280 110 L 380 60 L 480 90 L 580 50 L 700 100" />
          <path d="M 60 180 L 160 130 L 260 160 L 360 120 L 460 145 L 580 110 L 720 150" />
        </g>

        <path
          d="M 90 220
             Q 80 180, 130 150
             L 200 110
             Q 260 80, 340 90
             L 460 80
             Q 540 80, 600 110
             L 680 160
             Q 720 200, 720 260
             L 700 340
             Q 670 400, 600 420
             L 480 440
             Q 360 440, 260 420
             L 160 380
             Q 90 340, 90 280
             Z"
          fill="url(#uk-dots)"
          stroke="oklch(0.45 0.04 70)"
          strokeWidth="1.2"
          opacity="0.95"
        />
        <g
          stroke="oklch(0.65 0.07 220)"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        >
          <path d="M 180 130 Q 200 200, 230 280 Q 240 360, 220 420" strokeDasharray="4 4" />
          <path d="M 380 110 Q 360 200, 340 280 Q 320 360, 300 430" strokeDasharray="4 4" />
          <path d="M 560 130 Q 540 220, 500 300 Q 460 370, 420 430" strokeDasharray="4 4" />
        </g>
        <g
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="oklch(0.55 0.02 60)"
          letterSpacing="1.5"
          opacity="0.7"
        >
          <text x="380" y="50">— TIBET / CHINA —</text>
          <text x="30" y="260" transform="rotate(-90, 30, 260)">HIMACHAL</text>
          <text x="760" y="320" transform="rotate(90, 760, 320)">NEPAL</text>
          <text x="380" y="470">— UTTAR PRADESH —</text>
        </g>
      </svg>

      {pins.map((p) => {
        const isSelected = selected === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect && onSelect(p.id)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -100%)",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: onSelect ? "pointer" : "default",
            }}
            aria-label={p.name}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {!compact && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    background: isSelected ? "var(--moss)" : "var(--paper)",
                    color: isSelected ? "var(--paper)" : "var(--ink-2)",
                    border: `1px solid ${isSelected ? "var(--moss)" : "var(--line)"}`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected
                      ? "0 4px 12px color-mix(in oklch, var(--moss) 30%, transparent)"
                      : "none",
                  }}
                >
                  {p.name}
                  {p.elevation ? " · " + p.elevation : ""}
                </div>
              )}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${isSelected ? "var(--moss)" : "var(--line-2)"}`,
                }}
              ></div>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: isSelected ? "var(--moss)" : "var(--terra)",
                  border: "2px solid var(--paper)",
                  boxShadow: isSelected
                    ? "0 0 0 4px color-mix(in oklch, var(--moss) 25%, transparent), 0 2px 6px rgba(0,0,0,0.15)"
                    : "0 2px 4px rgba(0,0,0,0.15)",
                  marginTop: -2,
                }}
              ></div>
            </div>
          </button>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Uttarakhand · {pins.length} districts
      </div>
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted)",
          letterSpacing: "0.06em",
        }}
      >
        not to scale · prototype
      </div>
    </div>
  );
}

// ---------- UPIQR ----------
export interface UPIQRProps {
  upi: string;
  size?: number;
  label?: string;
}

export function UPIQR({ upi, size = 200, label }: UPIQRProps) {
  const cells = 25;
  const grid = useMemo(() => {
    const s = upi || "unknown@upi";
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const out: number[][] = [];
    for (let r = 0; r < cells; r++) {
      const row: number[] = [];
      for (let c = 0; c < cells; c++) {
        h = (h * 1103515245 + 12345 + r * 31 + c * 7) >>> 0;
        row.push((h & 7) > 2 ? 1 : 0);
      }
      out.push(row);
    }
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells / 2; c++) {
        out[r][cells - 1 - c] = out[r][c];
      }
    }
    const stampFinder = (sr: number, sc: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          out[sr + r][sc + c] = edge || inner ? 1 : 0;
        }
    };
    stampFinder(0, 0);
    stampFinder(0, cells - 7);
    stampFinder(cells - 7, 0);
    return out;
  }, [upi]);

  const cellSize = size / cells;
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          background: "var(--paper)",
          padding: 10,
          border: "1px solid var(--line)",
          borderRadius: 10,
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {grid.map((row, r) =>
            row.map((v, c) =>
              v ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="var(--ink)"
                />
              ) : null,
            ),
          )}
          <rect
            x={size / 2 - 14}
            y={size / 2 - 14}
            width={28}
            height={28}
            fill="var(--paper)"
            rx="3"
          />
          <circle cx={size / 2} cy={size / 2} r={8} fill="var(--moss)" />
        </svg>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ---------- Ornament ----------
export function Ornament({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "var(--muted)",
      }}
    >
      <hr className="dotted-rule" style={{ flex: 1 }} />
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <hr className="dotted-rule" style={{ flex: 1 }} />
    </div>
  );
}
