import Link from "next/link";
import { DistrictForm } from "../_components/district-form";
import { createDistrict } from "../actions";

export const dynamic = "force-dynamic";

export default function NewDistrictPage() {
  return (
    <div style={{ padding: "36px 28px 80px", maxWidth: 880, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        <Link
          href="/admin/districts"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← back to districts
        </Link>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 44,
          lineHeight: 1.05,
          margin: 0,
          marginBottom: 10,
        }}
      >
        Add a <em>district</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        A new district usually starts as <em>researching</em> (data review
        only). Promote it to <em>field-visited</em> after a site walk, then{" "}
        <em>active</em> once the first farmer is onboarded.
      </p>
      <DistrictForm action={createDistrict} mode="create" />
    </div>
  );
}
