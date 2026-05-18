"use client";

import { useActionState } from "react";
import Link from "next/link";
import type {
  DistrictOption,
  FarmerOption,
  PlotRecord,
} from "@/lib/db/admin-queries";
import type { PlotFormState } from "../actions";

type FormAction = (
  prev: PlotFormState,
  formData: FormData,
) => Promise<PlotFormState>;

interface Props {
  action: FormAction;
  districts: DistrictOption[];
  farmers: FarmerOption[];
  initial?: Partial<PlotRecord>;
  mode: "create" | "edit";
}

const initialState: PlotFormState = { error: null };

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

export function PlotForm({
  action,
  districts,
  farmers,
  initial = {},
  mode,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const initialCoStewards = initial.co_steward_ids ?? [];

  return (
    <form action={formAction}>
      {/* Identity */}
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
              e.g. <em>plot-sunita-naula</em> · used in URLs
            </div>
          </div>
          <div>
            <label style={labelStyle}>Local name (Hindi / Garhwali)</label>
            <input
              name="name"
              defaultValue={initial.name ?? ""}
              required
              placeholder="Naula ke Paas"
              style={{
                ...inputStyle,
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 16,
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>English subtitle</label>
            <input
              name="name_en"
              defaultValue={initial.name_en ?? ""}
              required
              placeholder="Near the spring"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Village</label>
            <input
              name="village"
              defaultValue={initial.village ?? ""}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>District</label>
            <select
              name="district_id"
              defaultValue={initial.district_id ?? ""}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                Select a district
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Aspect</label>
            <input
              name="aspect"
              defaultValue={initial.aspect ?? ""}
              placeholder="north-facing, south-west, etc."
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Land */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>the land</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Area (ha)</label>
            <input
              name="area_ha"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={initial.area_ha?.toString() ?? "0.8"}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Elevation (m)</label>
            <input
              name="elevation_m"
              type="number"
              min="0"
              defaultValue={initial.elevation_m ?? 1500}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Slope (°)</label>
            <input
              name="slope_deg"
              type="number"
              min="0"
              max="90"
              defaultValue={initial.slope_deg ?? 20}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Latitude (°N)</label>
            <input
              name="lat"
              type="number"
              step="0.000001"
              defaultValue={initial.lat ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Longitude (°E)</label>
            <input
              name="lng"
              type="number"
              step="0.000001"
              defaultValue={initial.lng ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Joined (display)</label>
            <input
              name="joined_at"
              defaultValue={initial.joined_at ?? ""}
              placeholder="Mar 2024"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Status & tenure */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>status &amp; tenure</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              defaultValue={initial.status ?? "researching"}
              style={inputStyle}
            >
              <option value="researching">researching (on the list)</option>
              <option value="field-visited">field-visited</option>
              <option value="planting">planting (active)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Land tenure</label>
            <select
              name="land_tenure"
              defaultValue={initial.land_tenure ?? "private"}
              style={inputStyle}
            >
              <option value="private">private (farmer-owned)</option>
              <option value="van-panchayat">van-panchayat (community forest)</option>
              <option value="community">community-managed</option>
              <option value="lease">leased</option>
            </select>
          </div>
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            fontSize: 14,
            color: "var(--ink-2)",
          }}
        >
          <input
            type="checkbox"
            name="panchayat_verified"
            defaultChecked={initial.panchayat_verified ?? false}
            style={{ width: 18, height: 18, accentColor: "oklch(0.42 0.085 145)" }}
          />
          <span>Panchayat verified (panchayat letter / resolution on file)</span>
        </label>
      </section>

      {/* Stewardship */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>stewardship</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Primary farmer (the on-ground steward)</label>
          <select
            name="primary_farmer_id"
            defaultValue={initial.primary_farmer_id ?? ""}
            required
            style={inputStyle}
          >
            <option value="" disabled>
              Select the primary farmer
            </option>
            {farmers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Co-stewards (optional)</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              padding: "12px 14px",
              background: "var(--paper-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 6,
            }}
          >
            {farmers.map((f) => (
              <label
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: "var(--ink-2)",
                }}
              >
                <input
                  type="checkbox"
                  name="co_steward_ids"
                  value={f.id}
                  defaultChecked={initialCoStewards.includes(f.id)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "oklch(0.42 0.085 145)",
                  }}
                />
                <span>{f.name}</span>
              </label>
            ))}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            For collectives (Van Panchayat, Mahila Mangal Dal). Leave empty for
            single-steward plots.
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>resources &amp; story</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Water source</label>
          <input
            name="water_source"
            defaultValue={initial.water_source ?? ""}
            placeholder="Naula spring · 200m east"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            defaultValue={initial.description ?? ""}
            rows={3}
            placeholder="What's on this plot, what's going in, what the farmer is doing..."
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      </section>

      {/* Soil */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>soil sample (optional)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>N</label>
            <input
              name="soil_N"
              type="number"
              step="0.1"
              defaultValue={initial.soil?.N ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>P</label>
            <input
              name="soil_P"
              type="number"
              step="0.1"
              defaultValue={initial.soil?.P ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>K</label>
            <input
              name="soil_K"
              type="number"
              step="0.1"
              defaultValue={initial.soil?.K ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>pH</label>
            <input
              name="soil_pH"
              type="number"
              step="0.1"
              defaultValue={initial.soil?.pH ?? ""}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>OM (%)</label>
            <input
              name="soil_OM"
              type="number"
              step="0.1"
              defaultValue={initial.soil?.OM ?? ""}
              style={inputStyle}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          From the Dehradun soil lab. Leave all blank if no sample yet.
        </div>
      </section>

      {/* Stats + tone */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>stats (displayed publicly)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Trees planted (lifetime)</label>
            <input
              name="trees_planted"
              type="number"
              min="0"
              defaultValue={initial.trees_planted ?? 0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Trees alive (current)</label>
            <input
              name="trees_alive"
              type="number"
              min="0"
              defaultValue={initial.trees_alive ?? 0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Photo tone</label>
            <select
              name="photo_tone"
              defaultValue={initial.photo_tone ?? "moss"}
              style={inputStyle}
            >
              <option value="moss">moss (green)</option>
              <option value="terra">terra (orange)</option>
              <option value="neutral">neutral</option>
            </select>
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
              ? "Create plot"
              : "Save changes"}
        </button>
        <Link
          href="/admin/plots"
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
