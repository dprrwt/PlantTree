import Link from "next/link";
import { getAllDistrictsForSelect } from "@/lib/db/admin-queries";
import { FarmerForm } from "../_components/farmer-form";
import { createFarmer } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewFarmerPage() {
  const districts = await getAllDistrictsForSelect();

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
          href="/admin/farmers"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← back to farmers
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
        Onboard a <em>farmer</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Only add a farmer here after a field visit and a verifying body has
        signed off. The UPI is what donors pay to — double-check it.
      </p>
      <FarmerForm action={createFarmer} districts={districts} mode="create" />
    </div>
  );
}
