import Link from "next/link";
import { notFound } from "next/navigation";
import { getDistrictById } from "@/lib/db/admin-queries";
import { DistrictForm } from "../../_components/district-form";
import { updateDistrict } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDistrictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const district = await getDistrictById(id);

  if (!district) notFound();

  const boundUpdate = updateDistrict.bind(null, id);

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
        Edit <em>{district.name}</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          marginBottom: 28,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Changes save immediately and update the visitor site on the next page
        load. The slug ({district.id}) is the primary key and can&apos;t be
        renamed.
      </p>
      <DistrictForm action={boundUpdate} initial={district} mode="edit" />
    </div>
  );
}
