import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllDistrictsForSelect,
  getFarmerById,
} from "@/lib/db/admin-queries";
import { FarmerForm } from "../../_components/farmer-form";
import { FarmerLoginPanel } from "../../_components/farmer-login-panel";
import { updateFarmer } from "../../actions";
import { getFarmerLoginStatus } from "../../login-actions";

export const dynamic = "force-dynamic";

export default async function EditFarmerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [farmer, districts, loginStatus] = await Promise.all([
    getFarmerById(id),
    getAllDistrictsForSelect(),
    getFarmerLoginStatus(id),
  ]);

  if (!farmer) notFound();

  const boundUpdate = updateFarmer.bind(null, id);

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
        Edit <em>{farmer.name}</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Changes save immediately. The slug ({farmer.id}) is the primary key and
        can&apos;t be renamed — create a new farmer + delete the old one if you
        really need a different slug.
      </p>
      <FarmerLoginPanel
        farmerId={farmer.id}
        farmerName={farmer.name}
        status={loginStatus}
      />
      <FarmerForm
        action={boundUpdate}
        districts={districts}
        initial={farmer}
        plotLinks={farmer.plot_links}
        mode="edit"
      />
    </div>
  );
}
