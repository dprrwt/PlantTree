"use client";

import React, { useCallback, useState } from "react";
import type { ReactNode } from "react";

// Simplified for standalone Next.js — no postMessage protocol to design tool.
// The panel toggles via a floating button.

export function useTweaks<T extends object>(
  defaults: T,
): [T, (key: keyof T | Partial<T>, val?: T[keyof T]) => void] {
  const [values, setValues] = useState<T>(defaults);
  const setTweak = useCallback(
    (keyOrEdits: keyof T | Partial<T>, val?: T[keyof T]) => {
      setValues((prev) => {
        const edits =
          typeof keyOrEdits === "object" && keyOrEdits !== null
            ? (keyOrEdits as Partial<T>)
            : ({ [keyOrEdits as keyof T]: val } as Partial<T>);
        return { ...prev, ...edits };
      });
    },
    [],
  );
  return [values, setTweak];
}

export function TweaksPanel({
  title = "Tweaks",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="twk-fab"
        onClick={() => setOpen(true)}
        title="Open Tweaks"
        aria-label="Open Tweaks"
      >
        ⚙
      </button>
    );
  }

  return (
    <div className="twk-panel" role="dialog" aria-label="Tweaks panel">
      <div className="twk-hd">
        <b>{title}</b>
        <button
          className="twk-x"
          aria-label="Close tweaks"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>
      <div className="twk-body">{children}</div>
    </div>
  );
}

export function TweakSection({
  title,
  subtitle,
  label,
  children,
}: {
  title?: string;
  subtitle?: string;
  label?: string;
  children?: ReactNode;
}) {
  const heading = label ?? title;
  return (
    <>
      {heading && <div className="twk-sect">{heading}</div>}
      {subtitle && (
        <div style={{ fontSize: 10, color: "rgba(41,38,27,0.5)", marginTop: -4 }}>
          {subtitle}
        </div>
      )}
      {children}
    </>
  );
}

export interface TweakOption<V> {
  value: V;
  label: string;
}

export function TweakRow({
  label,
  value,
  children,
  inline,
}: {
  label?: string;
  value?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "twk-row twk-row-h" : "twk-row"}>
      {label && (
        <div className="twk-lbl">
          <span>{label}</span>
          {value != null && <span className="twk-val">{value}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function TweakRadio<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: V;
  options: TweakOption<V>[];
  onChange: (v: V) => void;
}) {
  const labelLen = (o: TweakOption<V>) => o.label.length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments =
    maxLen <= ({ 2: 16, 3: 10 } as Record<number, number>)[options.length] ?? 0;

  if (!fitsAsSegments) {
    return (
      <TweakSelect label={label} value={value} options={options} onChange={onChange} />
    );
  }

  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const n = options.length;

  return (
    <TweakRow label={label}>
      <div role="radiogroup" className="twk-seg">
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

export function TweakSelect<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: V;
  options: TweakOption<V>[];
  onChange: (v: V) => void;
}) {
  return (
    <TweakRow label={label}>
      <select
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </TweakRow>
  );
}

export function TweakButton({
  children,
  onClick,
  secondary = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      className={secondary ? "twk-btn secondary" : "twk-btn"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
