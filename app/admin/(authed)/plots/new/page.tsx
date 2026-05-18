import Link from "next/link";
import {
  getAllDistrictsForSelect,
  getAllFarmersForSelect,
} from "@/lib/db/admin-queries";
import { PlotForm } from "../_components/plot-form";
import { createPlot } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPlotPage() {
  const [districts, farmers] = await Promise.all([
    getAllDistrictsForSelect(),
    getAllFarmersForSelect(),
  ]);

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
          href="/admin/plots"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← back to plots
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
        Add a <em>plot</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Only add a plot after a field visit. Start with status{" "}
        <em>researching</em> or <em>field-visited</em> — promote to{" "}
        <em>planting</em> once the panchayat letter is on file and the first
        sapling has gone in.
      </p>
      <PlotForm
        action={createPlot}
        districts={districts}
        farmers={farmers}
        mode="create"
      />
    </div>
  );
}
