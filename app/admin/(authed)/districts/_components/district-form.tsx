"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { DistrictRecord } from "@/lib/db/admin-queries";
import type { DistrictFormState } from "../actions";

type FormAction = (
  prev: DistrictFormState,
  formData: FormData,
) => Promise<DistrictFormState>;

interface Props {
  action: FormAction;
  initial?: Partial<DistrictRecord>;
  mode: "create" | "edit";
}

const initialState: DistrictFormState = { error: null };

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  background: "var(--paper-2)",
  border: "1px solid var(--line-2)",
  borderRadius: 6,
  color: "var(--ink)",
  boxSizing: "border-box",
};

const sectionStyle: React.CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: 22,
  marginBottom: 18,
};

const sectionHeader: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 14,
};

export function DistrictForm({ action, initial = {}, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {/* Identity + status */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>identity</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Slug (id)</label>
            <input
              name="id"
              defaultValue={initial.id ?? ""}
              required
              pattern="[a-z0-9-]+"
              readOnly={mode === "edit"}
              title="Lowercase letters, numbers, and hyphens only"
              style={{
                ...inputStyle,
                background:
                  mode === "edit" ? "var(--paper-3)" : "var(--paper-2)",
                color: mode === "edit" ? "var(--muted)" : "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            />
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              e.g. <em>almora</em> · used in URLs · can&apos;t change later
            </div>
          </div>
          <div>
            <label style={labelStyle}>District name</label>
            <input
              name="name"
              defaultValue={initial.name ?? ""}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Elevation (display)</label>
            <input
              name="elevation"
              defaultValue={initial.elevation ?? ""}
              required
              placeholder="1,650 m"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Map x (0–100)</label>
              <input
                name="x"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={initial.x ?? 50}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Map y (0–100)</label>
              <input
                name="y"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={initial.y ?? 50}
                required
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              defaultValue={initial.status ?? "researching"}
              style={inputStyle}
            >
              <option value="researching">researching</option>
              <option value="field-visited">field-visited</option>
              <option value="active">active</option>
              <option value="coming_next">coming next</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              name="priority"
              defaultValue={initial.priority ?? "medium"}
              style={inputStyle}
            >
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Active since (display)</label>
            <input
              name="active_since"
              defaultValue={initial.active_since ?? ""}
              placeholder="Mar 2024"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* The pitch */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>the pitch</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>One-line summary</label>
          <input
            name="summary"
            defaultValue={initial.summary ?? ""}
            required
            placeholder="Banj oak forests being lost to flammable chir pine — and with them, the springs."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Why (the ecological pitch)</label>
          <textarea
            name="why"
            defaultValue={initial.why ?? ""}
            required
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      </section>

      {/* Science */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>science</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Soil</label>
            <input
              name="soil"
              defaultValue={initial.soil ?? ""}
              required
              placeholder="Brown forest soil, mid-slope"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Rainfall</label>
            <input
              name="rainfall"
              defaultValue={initial.rainfall ?? ""}
              required
              placeholder="1,100 mm · monsoon-fed"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Canopy cover (%)</label>
            <input
              name="canopy"
              type="number"
              min="0"
              max="100"
              defaultValue={initial.canopy ?? 0}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fire risk</label>
            <input
              name="fire_risk"
              defaultValue={initial.fire_risk ?? ""}
              required
              placeholder="low (oak canopy returning)"
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Species we plant (comma-separated)</label>
          <input
            name="species"
            defaultValue={(initial.species ?? []).join(", ")}
            placeholder="Banj oak, Buransh, Kafal"
            style={inputStyle}
          />
        </div>
      </section>

      {/* History + field notes */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>history & field notes</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>History</label>
          <textarea
            name="history"
            defaultValue={initial.history ?? ""}
            required
            rows={4}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <div>
          <label style={labelStyle}>Field notes</label>
          <textarea
            name="field_notes"
            defaultValue={initial.field_notes ?? ""}
            required
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      </section>

      {/* Stats */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>stats (displayed on visitor pages)</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Trees planted</label>
            <input
              name="trees_planted"
              type="number"
              min="0"
              defaultValue={initial.trees_planted ?? 0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Farmers count</label>
            <input
              name="farmers_count"
              type="number"
              min="0"
              defaultValue={initial.farmers_count ?? 0}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {state.error && (
        <div
          style={{
            padding: "12px 14px",
            background:
              "color-mix(in oklch, var(--terra-soft) 35%, var(--paper))",
            border: "1px solid var(--terra)",
            borderRadius: 6,
            color: "var(--terra)",
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          {state.error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "12px 22px",
            borderRadius: 8,
            border: "1px solid var(--moss)",
            background: pending ? "var(--paper-2)" : "var(--moss)",
            color: pending ? "var(--muted)" : "var(--paper)",
            fontSize: 14,
            fontWeight: 500,
            cursor: pending ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {pending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create district"
              : "Save changes"}
        </button>
        <Link
          href="/admin/districts"
          style={{
            padding: "12px 22px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            color: "var(--ink-2)",
            fontSize: 14,
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
