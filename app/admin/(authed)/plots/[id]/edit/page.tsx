import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllDistrictsForSelect,
  getAllFarmersForSelect,
  getPlotForEdit,
} from "@/lib/db/admin-queries";
import { PlotForm } from "../../_components/plot-form";
import { updatePlot } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [plot, districts, farmers] = await Promise.all([
    getPlotForEdit(id),
    getAllDistrictsForSelect(),
    getAllFarmersForSelect(),
  ]);

  if (!plot) notFound();

  const boundUpdate = updatePlot.bind(null, id);

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
          fontStyle: "italic",
          lineHeight: 1.05,
          margin: 0,
          marginBottom: 4,
        }}
      >
        {plot.name}
      </h1>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: 24,
        }}
      >
        &ldquo;{plot.name_en}&rdquo; · {plot.village}
      </div>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Changes save immediately and update the visitor site on the next page
        load. The slug ({plot.id}) is the primary key and can&apos;t be
        renamed.
      </p>
      <PlotForm
        action={boundUpdate}
        districts={districts}
        farmers={farmers}
        initial={plot}
        mode="edit"
      />
    </div>
  );
}
