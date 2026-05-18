import Link from "next/link";
import {
  getAllFarmersIncludingDeleted,
  type OperatorFarmer,
} from "@/lib/db/admin-queries";
import { restoreFarmer, softDeleteFarmer } from "./actions";

export const dynamic = "force-dynamic";

export default async function FarmersListPage() {
  const farmers = await getAllFarmersIncludingDeleted();
  const active = farmers.filter((f) => !f.deletedAt);
  const deleted = farmers.filter((f) => f.deletedAt);

  return (
    <div style={{ padding: "36px 28px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
        }}
      >
        <div>
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
              href="/admin"
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              ← back to console
            </Link>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 44,
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Farmers
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              marginTop: 10,
              fontSize: 14,
              maxWidth: 540,
              lineHeight: 1.55,
            }}
          >
            Add, update, or delist farmers on the platform. Deleting is soft —
            historical donations and trees stay intact; the farmer just stops
            appearing on the public site.
          </p>
        </div>
        <Link
          href="/admin/farmers/new"
          style={{
            padding: "12px 22px",
            borderRadius: 8,
            border: "1px solid var(--moss)",
            background: "var(--moss)",
            color: "var(--paper)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          + Onboard a farmer
        </Link>
      </div>

      <FarmerTable
        title={`Active · ${active.length}`}
        farmers={active}
        deleted={false}
      />

      {deleted.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <FarmerTable
            title={`Deleted · ${deleted.length}`}
            farmers={deleted}
            deleted={true}
          />
        </div>
      )}
    </div>
  );
}

function FarmerTable({
  title,
  farmers,
  deleted,
}: {
  title: string;
  farmers: OperatorFarmer[];
  deleted: boolean;
}) {
  return (
    <section
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "1px dotted var(--line-2)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: deleted ? "var(--muted)" : "var(--ink-2)",
        }}
      >
        {title}
      </div>

      {farmers.length === 0 ? (
        <div
          style={{
            padding: "32px 22px",
            color: "var(--muted)",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {deleted ? "No deleted farmers." : "No farmers yet — onboard one."}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.6fr 0.6fr 0.8fr auto",
              gap: 16,
              padding: "10px 22px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span>farmer</span>
            <span>district · village</span>
            <span>status</span>
            <span>alive</span>
            <span>verified by</span>
            <span></span>
          </div>
          {farmers.map((f, i) => (
            <div
              key={f.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 0.6fr 0.6fr 0.8fr auto",
                gap: 16,
                padding: "14px 22px",
                alignItems: "center",
                borderBottom:
                  i < farmers.length - 1 ? "1px dotted var(--line-2)" : "none",
                fontSize: 14,
                opacity: deleted ? 0.6 : 1,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                  }}
                >
                  {f.name}
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
                  {f.id} · {f.upi}
                </div>
              </div>
              <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                {f.districtName} · {f.village}
              </div>
              <div>
                <StatusChip status={f.status} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                {f.treesAlive}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {f.verifiedByOrg ?? "—"}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {!deleted && (
                  <Link
                    href={`/admin/farmers/${f.id}/edit`}
                    style={linkButtonStyle("ghost")}
                  >
                    Edit
                  </Link>
                )}
                {!deleted ? (
                  <form
                    action={softDeleteFarmer.bind(null, f.id)}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" style={linkButtonStyle("terra")}>
                      Delete
                    </button>
                  </form>
                ) : (
                  <form
                    action={restoreFarmer.bind(null, f.id)}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" style={linkButtonStyle("moss")}>
                      Restore
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusChip({ status }: { status: OperatorFarmer["status"] }) {
  const color =
    status === "active"
      ? "var(--moss)"
      : status === "pending"
        ? "var(--terra)"
        : "var(--muted)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color,
        border: `1px solid ${color}`,
        padding: "2px 8px",
        borderRadius: 4,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}

function linkButtonStyle(
  tone: "ghost" | "moss" | "terra",
): React.CSSProperties {
  const map = {
    ghost: {
      background: "transparent",
      color: "var(--ink-2)",
      border: "1px solid var(--line)",
    },
    moss: {
      background: "transparent",
      color: "var(--moss)",
      border: "1px solid var(--moss)",
    },
    terra: {
      background: "transparent",
      color: "var(--terra)",
      border: "1px solid var(--terra)",
    },
  } as const;
  return {
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    ...map[tone],
  };
}
