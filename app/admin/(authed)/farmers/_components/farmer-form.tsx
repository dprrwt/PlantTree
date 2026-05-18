"use client";

import { useActionState } from "react";
import Link from "next/link";
import type {
  DistrictOption,
  FarmerPlotLink,
  FarmerRecord,
} from "@/lib/db/admin-queries";
import type { FarmerFormState } from "../actions";

type FormAction = (
  prev: FarmerFormState,
  formData: FormData,
) => Promise<FarmerFormState>;

interface Props {
  action: FormAction;
  districts: DistrictOption[];
  initial?: Partial<FarmerRecord>;
  mode: "create" | "edit";
  plotLinks?: FarmerPlotLink[];
}

const initialState: FarmerFormState = { error: null };

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

export function FarmerForm({
  action,
  districts,
  initial = {},
  mode,
  plotLinks = [],
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

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
                background: mode === "edit" ? "var(--paper-3)" : "var(--paper-2)",
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
                letterSpacing: "0.04em",
              }}
            >
              e.g. <em>sunita</em> · used in URLs · cannot be changed later
            </div>
          </div>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              name="name"
              defaultValue={initial.name ?? ""}
              required
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
        </div>
      </section>

      {/* Payment + plot */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>payment & plot</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>UPI ID</label>
            <input
              name="upi"
              defaultValue={initial.upi ?? ""}
              required
              placeholder="name@oksbi"
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              name="phone"
              defaultValue={initial.phone ?? ""}
              required
              placeholder="+91 9XXXX XXXXX"
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Rate (plant only, ₹)</label>
            <input
              name="rate"
              type="number"
              min="0"
              defaultValue={initial.rate ?? 500}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Rate (plant + 1yr care, ₹)</label>
            <input
              name="rate_care"
              type="number"
              min="0"
              defaultValue={initial.rate_care ?? 1500}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Years experience</label>
            <input
              name="years"
              type="number"
              min="0"
              defaultValue={initial.years ?? 0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Plot description</label>
            <input
              name="plot"
              defaultValue={initial.plot ?? ""}
              placeholder="0.8 ha · terraced"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>story</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Quote (Hindi / original)</label>
          <textarea
            name="quote_original"
            defaultValue={initial.quote_original ?? ""}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Quote (English translation)</label>
          <textarea
            name="quote_en"
            defaultValue={initial.quote_en ?? ""}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <div>
          <label style={labelStyle}>Plants (comma-separated)</label>
          <input
            name="plants"
            defaultValue={(initial.plants ?? []).join(", ")}
            placeholder="Banj oak, Buransh, Kafal"
            style={inputStyle}
          />
        </div>
      </section>

      {/* Verification + status */}
      <section style={sectionStyle}>
        <div style={sectionHeader}>verification</div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Verified by (organisation)</label>
            <input
              name="verified_by_org"
              defaultValue={initial.verified_by_org ?? ""}
              placeholder="Van Panchayat, Mahila Mangal Dal, etc."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Verified date</label>
            <input
              name="verified_at"
              type="date"
              defaultValue={
                initial.verified_at
                  ? initial.verified_at.slice(0, 10)
                  : ""
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              defaultValue={initial.status ?? "active"}
              style={inputStyle}
            >
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Photo tone (for placeholders)</label>
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

      {mode === "edit" && (
        <section style={sectionStyle}>
          <div style={sectionHeader}>plots tended</div>
          {plotLinks.length === 0 ? (
            <div
              style={{
                padding: "16px 12px",
                color: "var(--muted)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Not yet linked to any plots.{" "}
              <Link
                href="/admin/plots/new"
                style={{ color: "var(--moss)", textDecoration: "none" }}
              >
                Add a plot
              </Link>{" "}
              and set this farmer as its primary steward.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {plotLinks.map((link) => (
                <div
                  key={link.plot_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--paper-2)",
                    border: "1px solid var(--line-2)",
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 16,
                      }}
                    >
                      {link.plot_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        marginTop: 2,
                      }}
                    >
                      &ldquo;{link.plot_name_en}&rdquo;
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color:
                        link.role === "primary"
                          ? "var(--moss)"
                          : "var(--muted)",
                      border: `1px solid ${
                        link.role === "primary"
                          ? "var(--moss)"
                          : "var(--line-2)"
                      }`,
                      padding: "2px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {link.role}
                  </span>
                  <Link
                    href={`/admin/plots/${link.plot_id}/edit`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "var(--ink-2)",
                      border: "1px solid var(--line)",
                      textDecoration: "none",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit plot →
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              lineHeight: 1.5,
            }}
          >
            Plot assignments are managed from the{" "}
            <Link
              href="/admin/plots"
              style={{ color: "var(--muted)", textDecoration: "underline" }}
            >
              plots CRUD
            </Link>{" "}
            to keep the primary-farmer constraint safe. Add this farmer as
            primary or co-steward there.
          </div>
        </section>
      )}

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

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
              ? "Create farmer"
              : "Save changes"}
        </button>
        <Link
          href="/admin/farmers"
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
