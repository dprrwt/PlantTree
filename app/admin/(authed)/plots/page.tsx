import Link from "next/link";
import {
  getAllPlotsIncludingDeleted,
  type OperatorPlot,
} from "@/lib/db/admin-queries";
import { restorePlot, softDeletePlot } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<OperatorPlot["status"], string> = {
  planting: "var(--moss)",
  "field-visited": "var(--terra)",
  researching: "var(--muted)",
};

const TENURE_SHORT: Record<OperatorPlot["landTenure"], string> = {
  private: "private",
  "van-panchayat": "van-panchayat",
  community: "community",
  lease: "lease",
};

export default async function PlotsListPage() {
  const plots = await getAllPlotsIncludingDeleted();
  const active = plots.filter((p) => !p.deletedAt);
  const deleted = plots.filter((p) => p.deletedAt);

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
            Plots
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              marginTop: 10,
              fontSize: 14,
              maxWidth: 620,
              lineHeight: 1.55,
            }}
          >
            The actual piece of land each tree lives on. Add a plot after a
            field visit; mark it <em>planting</em> once the panchayat letter is
            on file and the first sapling goes in.
          </p>
        </div>
        <Link
          href="/admin/plots/new"
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
          + Add a plot
        </Link>
      </div>

      <PlotTable
        title={`Active · ${active.length}`}
        plots={active}
        deleted={false}
      />

      {deleted.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <PlotTable
            title={`Deleted · ${deleted.length}`}
            plots={deleted}
            deleted={true}
          />
        </div>
      )}
    </div>
  );
}

function PlotTable({
  title,
  plots,
  deleted,
}: {
  title: string;
  plots: OperatorPlot[];
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

      {plots.length === 0 ? (
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
          {deleted ? "No deleted plots." : "No plots yet — add one."}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 1fr 0.8fr 0.7fr 0.6fr 0.6fr 0.6fr auto",
              gap: 14,
              padding: "10px 22px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span>plot</span>
            <span>district · village</span>
            <span>steward</span>
            <span>status</span>
            <span>tenure</span>
            <span>area</span>
            <span>trees</span>
            <span></span>
          </div>
          {plots.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.4fr 1fr 0.8fr 0.7fr 0.6fr 0.6fr 0.6fr auto",
                gap: 14,
                padding: "14px 22px",
                alignItems: "center",
                borderBottom:
                  i < plots.length - 1 ? "1px dotted var(--line-2)" : "none",
                fontSize: 14,
                opacity: deleted ? 0.6 : 1,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 17,
                  }}
                >
                  {p.name}
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
                  &ldquo;{p.nameEn}&rdquo;
                </div>
              </div>
              <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                {p.districtName} · {p.village}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                {p.primaryFarmerName ?? "—"}
                {p.coStewardCount > 0 && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--muted)",
                      marginTop: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    + {p.coStewardCount} co-steward
                    {p.coStewardCount === 1 ? "" : "s"}
                  </div>
                )}
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: STATUS_COLOR[p.status],
                    border: `1px solid ${STATUS_COLOR[p.status]}`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.status}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-2)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {TENURE_SHORT[p.landTenure]}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                {p.areaHa}
                <span style={{ fontSize: 10, color: "var(--muted)" }}> ha</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
                {p.treesPlanted}
              </div>
              <div
                style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}
              >
                {!deleted && (
                  <Link
                    href={`/admin/plots/${p.id}/edit`}
                    style={linkButtonStyle("ghost")}
                  >
                    Edit
                  </Link>
                )}
                {!deleted ? (
                  <form
                    action={softDeletePlot.bind(null, p.id)}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" style={linkButtonStyle("terra")}>
                      Delete
                    </button>
                  </form>
                ) : (
                  <form
                    action={restorePlot.bind(null, p.id)}
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
