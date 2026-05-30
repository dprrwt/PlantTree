import Link from "next/link";
import {
  getAllFarmers,
  getOperatorTotals,
  getOverdueDonations,
  getPendingDonations,
  getSubmissions,
  getTreesAwaitingPhoto,
  type OperatorFarmer,
  type OperatorSubmission,
  type OverdueDonation,
  type PendingDonation,
  type TreeAwaitingPhoto,
} from "@/lib/db/admin-queries";
import { rejectDonation, verifyDonation } from "./donations/actions";
import { dismissSubmission, promoteSubmission } from "./submissions/actions";

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  plant_only: "plant only",
  plant_care: "plant + care",
  grove_of_5: "grove of 5",
};

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function AdminPage() {
  const [totals, submissions, pending, overdue, awaitingPhoto, farmers] =
    await Promise.all([
      getOperatorTotals(),
      getSubmissions(),
      getPendingDonations(),
      getOverdueDonations(),
      getTreesAwaitingPhoto(14),
      getAllFarmers(),
    ]);

  return (
    <div style={{ padding: "36px 28px 80px", maxWidth: 1280, margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
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
          a snapshot of what needs you today
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 56,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Operator <em>console</em>
        </h1>
        <p
          style={{
            color: "var(--ink-2)",
            marginTop: 14,
            maxWidth: 620,
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          Every payment that comes in is yours to verify before it becomes a
          tree. Every tree planted is yours to keep honest. Below — what&apos;s
          waiting for a decision, what&apos;s overdue, and what&apos;s quiet.
        </p>
      </div>

      {/* TOTALS STRIP */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 14,
          marginBottom: 40,
        }}
      >
        <Kpi label="active farmers" value={totals.farmers} />
        <Kpi label="trees in ground" value={totals.trees} />
        <Kpi label="donors" value={totals.donors} />
        <Kpi label="paid to farmers" value={inr(totals.totalRaisedInr)} small />
        <Kpi
          label="pending verify"
          value={totals.pendingVerify}
          tone={totals.pendingVerify > 0 ? "terra" : "muted"}
        />
        <Kpi
          label="overdue"
          value={totals.overdue}
          tone={totals.overdue > 0 ? "terra" : "muted"}
        />
      </div>

      {/* NEEDS YOUR ATTENTION */}
      <SectionHeader label="needs your attention" />

      <DashSection
        title="New submissions"
        subtitle="Plots and farmers contributed from the public form. Review, call to confirm, promote into research."
        count={submissions.length}
        tone={submissions.length > 0 ? "terra" : "muted"}
      >
        {submissions.length === 0 ? (
          <EmptyState text="No new submissions." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {submissions.map((s, i) => (
              <SubmissionRow
                key={s.id}
                s={s}
                divider={i < submissions.length - 1}
              />
            ))}
          </div>
        )}
      </DashSection>

      <DashSection
        title="Pending verification"
        subtitle="Donors have sent payment screenshots. Verify and assign a tree number."
        count={pending.length}
        tone={pending.length > 0 ? "terra" : "muted"}
      >
        {pending.length === 0 ? (
          <EmptyState text="All caught up. No pending payments." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pending.map((p, i) => (
              <PendingRow key={p.id} p={p} divider={i < pending.length - 1} />
            ))}
          </div>
        )}
      </DashSection>

      <DashSection
        title="Trees overdue to plant"
        subtitle="Past the 7-day window. Chase the farmer or refund the donor."
        count={overdue.length}
        tone={overdue.length > 0 ? "terra" : "muted"}
      >
        {overdue.length === 0 ? (
          <EmptyState text="Nothing overdue." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {overdue.map((o, i) => (
              <OverdueRow key={o.id} o={o} divider={i < overdue.length - 1} />
            ))}
          </div>
        )}
      </DashSection>

      <DashSection
        title="Awaiting photo update"
        subtitle="Planted trees that haven't had a photo in 14+ days. Nudge the farmer."
        count={awaitingPhoto.length}
        tone={awaitingPhoto.length > 3 ? "terra" : "muted"}
      >
        {awaitingPhoto.length === 0 ? (
          <EmptyState text="Every tree has a fresh photo." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {awaitingPhoto.map((t, i) => (
              <AwaitingPhotoRow
                key={t.treeId}
                t={t}
                divider={i < awaitingPhoto.length - 1}
              />
            ))}
          </div>
        )}
      </DashSection>

      {/* THE NETWORK */}
      <div style={{ height: 24 }} />
      <SectionHeader label="the network" />
      <DashSection
        title="Farmers on the platform"
        subtitle="Every farmer you've onboarded. Status, planted trees, pending workload, verification."
        count={farmers.length}
        action={
          <Link
            href="/admin/farmers"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--moss)",
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            Manage farmers →
          </Link>
        }
      >
        <FarmersTable farmers={farmers} />
      </DashSection>

      {/* QUICK ACTIONS — stubs until auth + write paths land */}
      <div
        style={{
          marginTop: 32,
          padding: 22,
          background: "var(--paper-2)",
          borderRadius: 12,
          border: "1px dashed var(--line-2)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          quick actions
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/admin/farmers/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              background: "var(--moss)",
              color: "var(--paper)",
              border: "1px solid var(--moss)",
              textDecoration: "none",
            }}
          >
            + Onboard a farmer
          </Link>
          <Link
            href="/admin/farmers"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              textDecoration: "none",
            }}
          >
            Manage farmers →
          </Link>
          <Link
            href="/admin/districts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              textDecoration: "none",
            }}
          >
            Manage districts →
          </Link>
          <Link
            href="/admin/plots"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              textDecoration: "none",
            }}
          >
            Manage plots →
          </Link>
          <StubButton label="Record a manual donation →" />
          <StubButton label="Export ledger (CSV) →" />
        </div>
        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.5,
            maxWidth: 600,
          }}
        >
          Action buttons are stubs — they&apos;ll go live once operator login is
          wired up and write paths through RLS are open. Until then this console
          is read-only.
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// UI helpers (server-rendered, plain styled divs)
// ----------------------------------------------------------------------------

function Kpi({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: number | string;
  tone?: "moss" | "terra" | "muted";
  small?: boolean;
}) {
  const color =
    tone === "terra"
      ? "var(--terra)"
      : tone === "moss"
        ? "var(--moss)"
        : "var(--ink)";
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: small ? 28 : 36,
          lineHeight: 1,
          color,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      <hr
        style={{
          flex: 1,
          border: 0,
          borderTop: "1px dashed var(--line-2)",
          margin: 0,
        }}
      />
    </div>
  );
}

function DashSection({
  title,
  subtitle,
  count,
  tone,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  count: number;
  tone?: "terra" | "muted";
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const stampColor =
    tone === "terra" ? "var(--terra)" : "var(--muted)";
  return (
    <section
      style={{
        marginBottom: 22,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 22,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
          right: 22,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          background: "var(--paper)",
          border: `1px solid ${stampColor}`,
          color: stampColor,
          padding: "2px 8px",
          borderRadius: 4,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {count}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 18,
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: "var(--ink-2)",
              margin: "6px 0 18px",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "24px 12px",
        textAlign: "center",
        color: "var(--muted)",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 18,
      }}
    >
      {text}
    </div>
  );
}

function SubmissionRow({
  s,
  divider,
}: {
  s: OperatorSubmission;
  divider: boolean;
}) {
  const addingLabel =
    s.adding === "both"
      ? "Plot + farmer"
      : s.adding === "plot"
        ? "A plot"
        : "A farmer";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr 1.1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: divider ? "1px dotted var(--line-2)" : "none",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          {s.by}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          {s.who} · {s.when} · {s.id}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14 }}>
          {addingLabel} · <strong>{s.village}</strong>, {s.district}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          {s.land ?? "—"}
          {s.farmer
            ? ` · farmer: ${s.farmer}${s.agreed === "yes" ? " (agreed)" : " (lead)"}`
            : ""}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {s.trust.map((t) => (
          <span
            key={t}
            className="tag"
            style={{
              fontSize: 9,
              color: "var(--moss)",
              borderColor: "color-mix(in oklch, var(--moss) 50%, var(--line))",
            }}
          >
            ✓ {t}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <form action={promoteSubmission.bind(null, s.id)} style={{ display: "inline" }}>
          <button type="submit" style={actionButtonStyle("moss")}>
            Promote →
          </button>
        </form>
        <form action={dismissSubmission.bind(null, s.id)} style={{ display: "inline" }}>
          <button type="submit" style={actionButtonStyle("ghost")}>
            Dismiss
          </button>
        </form>
      </div>
    </div>
  );
}

function PendingRow({
  p,
  divider,
}: {
  p: PendingDonation;
  divider: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr 1.4fr 1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: divider ? "1px dotted var(--line-2)" : "none",
      }}
    >
      <ProofThumbnail url={p.paymentProofUrl} />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          {p.isAnonymous ? "Anonymous" : p.donorName}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          {p.donorCity ?? "—"} · {timeAgo(p.createdAt)} · via {p.paymentMethod}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14 }}>
          to <strong>{p.farmerName}</strong> · {p.farmerVillage}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          UPI: {p.farmerUpi}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
          {inr(p.amountInr)}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          {TIER_LABEL[p.tier] ?? p.tier}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <form
          action={verifyDonation.bind(null, p.id)}
          style={{ display: "inline" }}
        >
          <button type="submit" style={actionButtonStyle("moss")}>
            Verify →
          </button>
        </form>
        <form
          action={rejectDonation.bind(null, p.id)}
          style={{ display: "inline" }}
        >
          <button type="submit" style={actionButtonStyle("ghost")}>
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}

function ProofThumbnail({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          border: "1px dashed var(--line-2)",
          background: "var(--paper-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.04em",
          textAlign: "center",
          padding: 4,
        }}
        title="No screenshot attached"
      >
        no proof
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open full-size payment screenshot"
      style={{
        display: "block",
        width: 64,
        height: 64,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--line)",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Payment screenshot"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </a>
  );
}

function OverdueRow({
  o,
  divider,
}: {
  o: OverdueDonation;
  divider: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr 1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: divider ? "1px dotted var(--line-2)" : "none",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          {o.treeSpecies ?? "—"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          {o.treeId ?? "(no tree #)"} · {TIER_LABEL[o.tier] ?? o.tier}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14 }}>
          for <strong>{o.donorName}</strong> · planted by{" "}
          <strong>{o.farmerName}</strong>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          farmer phone: {o.farmerPhone}
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--terra)",
          }}
        >
          {o.daysOverdue}d
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          overdue
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <StubButton label="Chase →" tone="terra" small />
        <StubButton label="Refund" tone="ghost" small />
      </div>
    </div>
  );
}

function AwaitingPhotoRow({
  t,
  divider,
}: {
  t: TreeAwaitingPhoto;
  divider: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr 1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: divider ? "1px dotted var(--line-2)" : "none",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          {t.species}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          {t.treeId} · planted {new Date(t.plantedAt).toLocaleDateString("en-IN")}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14 }}>
          <strong>{t.farmerName}</strong> · donor: {t.donorName}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          last seen: {t.lastUpdateAt ? new Date(t.lastUpdateAt).toLocaleDateString("en-IN") : "never"}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
          {t.daysSinceUpdate === 999 ? "—" : `${t.daysSinceUpdate}d`}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          since update
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <StubButton label="Nudge farmer →" small />
      </div>
    </div>
  );
}

function FarmersTable({ farmers }: { farmers: OperatorFarmer[] }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 0.6fr 0.6fr 0.8fr 0.8fr",
          gap: 16,
          padding: "10px 4px",
          borderBottom: "1px solid var(--line)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span>farmer</span>
        <span>district · village</span>
        <span>status</span>
        <span>alive</span>
        <span>pending</span>
        <span>verified by</span>
      </div>
      {farmers.map((f, i) => {
        const statusColor =
          f.status === "active"
            ? "var(--moss)"
            : f.status === "pending"
              ? "var(--terra)"
              : "var(--muted)";
        return (
          <div
            key={f.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.6fr 0.6fr 0.8fr 0.8fr",
              gap: 16,
              padding: "14px 4px",
              alignItems: "center",
              borderBottom:
                i < farmers.length - 1 ? "1px dotted var(--line-2)" : "none",
              fontSize: 14,
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
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
                {f.upi}
              </div>
            </div>
            <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
              {f.districtName} · {f.village}
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: statusColor,
                  border: `1px solid ${statusColor}`,
                  padding: "2px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {f.status}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
              {f.treesAlive}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
              {f.pendingTrees}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {f.verifiedByOrg ?? "—"}
              {f.verifiedAt && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    marginTop: 2,
                  }}
                >
                  {new Date(f.verifiedAt).toLocaleDateString("en-IN")}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function actionButtonStyle(
  tone: "moss" | "terra" | "ghost",
): React.CSSProperties {
  const palette = {
    moss: {
      background: "var(--moss)",
      color: "var(--paper)",
      border: "1px solid var(--moss)",
    },
    terra: {
      background: "var(--terra)",
      color: "var(--paper)",
      border: "1px solid var(--terra)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-2)",
      border: "1px solid var(--line)",
    },
  } as const;
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    ...palette[tone],
  };
}

function StubButton({
  label,
  tone = "default",
  small,
}: {
  label: string;
  tone?: "default" | "moss" | "terra" | "ghost";
  small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--ink)",
      color: "var(--paper)",
      border: "1px solid var(--ink)",
    },
    moss: {
      background: "var(--moss)",
      color: "var(--paper)",
      border: "1px solid var(--moss)",
    },
    terra: {
      background: "var(--terra)",
      color: "var(--paper)",
      border: "1px solid var(--terra)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-2)",
      border: "1px solid var(--line)",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "6px 12px" : "10px 16px",
        borderRadius: 6,
        fontSize: small ? 12 : 14,
        fontFamily: "var(--font-sans, inherit)",
        cursor: "not-allowed",
        opacity: 0.7,
        ...styles[tone],
      }}
      title="Wired up after operator login lands"
    >
      {label}
    </span>
  );
}
