import Link from "next/link";
import {
  getAllDistrictsIncludingDeleted,
  type OperatorDistrict,
} from "@/lib/db/admin-queries";
import { restoreDistrict, softDeleteDistrict } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<OperatorDistrict["status"], string> = {
  active: "var(--moss)",
  "field-visited": "var(--terra)",
  researching: "var(--muted)",
  coming_next: "var(--muted)",
};

export default async function DistrictsListPage() {
  const districts = await getAllDistrictsIncludingDeleted();
  const active = districts.filter((d) => !d.deletedAt);
  const deleted = districts.filter((d) => d.deletedAt);

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
            Districts
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              marginTop: 10,
              fontSize: 14,
              maxWidth: 580,
              lineHeight: 1.55,
            }}
          >
            Add a new district once a field visit and soil-data review are
            complete. Districts move from <em>on the list</em> →{" "}
            <em>field-visited</em> → <em>active</em> as the relationship
            deepens.
          </p>
        </div>
        <Link
          href="/admin/districts/new"
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
          + Add a district
        </Link>
      </div>

      <DistrictTable
        title={`Active · ${active.length}`}
        districts={active}
        deleted={false}
      />

      {deleted.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <DistrictTable
            title={`Deleted · ${deleted.length}`}
            districts={deleted}
            deleted={true}
          />
        </div>
      )}
    </div>
  );
}

function DistrictTable({
  title,
  districts,
  deleted,
}: {
  title: string;
  districts: OperatorDistrict[];
  deleted: boolean;
}) {
  return (
    <section
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 10,
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

      {districts.length === 0 ? (
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
          {deleted ? "No deleted districts." : "No districts yet — add one."}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.6fr 0.8fr 0.6fr 0.6fr 0.6fr auto",
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
            <span>district</span>
            <span>elevation</span>
            <span>status</span>
            <span>priority</span>
            <span>trees</span>
            <span>farmers</span>
            <span></span>
          </div>
          {districts.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.2fr 0.6fr 0.8fr 0.6fr 0.6fr 0.6fr auto",
                gap: 16,
                padding: "14px 22px",
                alignItems: "center",
                borderBottom:
                  i < districts.length - 1
                    ? "1px dotted var(--line-2)"
                    : "none",
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
                  {d.name}
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
                  {d.id}
                  {d.activeSince ? ` · since ${d.activeSince}` : ""}
                </div>
              </div>
              <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                {d.elevation}
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: STATUS_COLOR[d.status],
                    border: `1px solid ${STATUS_COLOR[d.status]}`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {d.status}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color:
                    d.priority === "critical"
                      ? "var(--terra)"
                      : "var(--ink-2)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {d.priority}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                {d.treesPlanted.toLocaleString()}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                {d.farmersCount}
              </div>
              <div
                style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}
              >
                {!deleted && (
                  <Link
                    href={`/admin/districts/${d.id}/edit`}
                    style={linkButtonStyle("ghost")}
                  >
                    Edit
                  </Link>
                )}
                {!deleted ? (
                  <form
                    action={softDeleteDistrict.bind(null, d.id)}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" style={linkButtonStyle("terra")}>
                      Delete
                    </button>
                  </form>
                ) : (
                  <form
                    action={restoreDistrict.bind(null, d.id)}
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
