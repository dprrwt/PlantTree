// Server-side renderer for the bilingual Farmer Charter.
// Loads design_extract/handoff-charter/farmer-charter.html, substitutes the
// {{token}} markers with the farmer's verified data, returns the final HTML.
// The route handler wraps this with the HTTP layer. Mirrors lib/certificates.ts.
import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "design_extract",
  "handoff-charter",
  "farmer-charter.html",
);

const TENURE_LABEL: Record<string, string> = {
  private: "Private plot",
  "van-panchayat": "Van Panchayat",
  community: "Community grove",
  lease: "Leased",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyTokens(html: string, tokens: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(tokens, key)
      ? escapeHtml(tokens[key])
      : match,
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yearFromText(s: string | null): string | null {
  if (!s) return null;
  const m = s.match(/(19|20)\d{2}/);
  return m ? m[0] : null;
}

// "Feb 2024" from an ISO timestamp, in IST.
function monthYearIST(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// "12 mar 2024" (lowercase) — matches the caption's issued line.
function dayMonthYearLowerIST(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })
    .toLowerCase();
}

// "2024-03-12 · 14:08 IST" — matches the digital-signature timestamp.
function signatureStampIST(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} · ${get("hour")}:${get("minute")} IST`;
}

export type CharterResult =
  | { ok: true; html: string }
  | { ok: false; status: number; message: string };

export async function renderFarmerCharter(
  farmerId: string,
): Promise<CharterResult> {
  const supabase = createAdminClient();

  const { data: farmer, error } = await supabase
    .from("farmers")
    .select(`
      id, name, village, upi, years, trees_planted, trees_alive,
      verified_by_org, verified_at, verify_token,
      district:districts!district_id (name),
      farmer_plots (
        plot:plots!plot_id (land_tenure, panchayat_verified, joined_at)
      )
    `)
    .eq("id", farmerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { ok: false, status: 500, message: error.message };
  if (!farmer) return { ok: false, status: 404, message: "Farmer not found" };

  const f = farmer as any;
  const districtName = f.district?.name ?? "—";
  const plots = (f.farmer_plots ?? [])
    .map((fp: any) => fp.plot)
    .filter(Boolean);

  // Land tenure → label + sub sentence (mirrors FarmerVerifiedCard).
  const tenureKinds = Array.from(
    new Set(plots.map((p: any) => p.land_tenure).filter(Boolean)),
  ) as string[];
  const tenureLabel =
    tenureKinds.map((k) => TENURE_LABEL[k] ?? k).join(" + ") || "On file";
  const tenureVerified = plots.some((p: any) => p.panchayat_verified);
  const tenureSub = tenureVerified
    ? `${tenureLabel} · panchayat resolution on file`
    : tenureLabel;

  const treesPlanted = f.trees_planted ?? 0;
  const treesAlive = f.trees_alive ?? 0;
  const survival =
    treesPlanted > 0 ? `${Math.round((treesAlive / treesPlanted) * 100)}%` : "—";

  // Member since: earliest plot join year, else the verification year.
  const plotYears = plots
    .map((p: any) => yearFromText(p.joined_at))
    .filter(Boolean) as string[];
  const memberSince =
    (plotYears.length ? plotYears.sort()[0] : null) ??
    (f.verified_at ? yearFromText(f.verified_at) : null) ??
    "—";

  const verifiedAt: string | null = f.verified_at ?? null;
  const firstName = (f.name as string).split(" ")[0] || f.name;
  const idHash = createHash("sha256")
    .update(f.id)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

  const tokens: Record<string, string> = {
    farmerName: f.name,
    avatarInitial: (f.name as string).trim().charAt(0),
    village: f.village ?? "—",
    district: districtName,
    districtUpper: districtName.toUpperCase(),
    memberSince,
    fCode: `F-${firstName.slice(0, 3).toUpperCase()}-${String(f.years ?? 0).padStart(2, "0")}`,
    verifiedBy: f.verified_by_org ?? "PlantTree operator",
    verifiedMonth: verifiedAt ? monthYearIST(verifiedAt) : "pending",
    tenureSub,
    upiId: f.upi ?? "—",
    years: String(f.years ?? 0),
    treesPlanted: String(treesPlanted),
    treesAlive: String(treesAlive),
    survival,
    plotsCount: String(plots.length),
    idRef: `PT-ID-${idHash}·••••`,
    signedAt: verifiedAt ? signatureStampIST(verifiedAt) : "pending verification",
    issuedOn: verifiedAt ? dayMonthYearLowerIST(verifiedAt) : "—",
    farmerSlug: slugify(f.name),
    farmerId: f.id,
    verifyToken: (f.verify_token as string | null) ?? "—",
  };

  const template = await readFile(TEMPLATE_PATH, "utf-8");
  return { ok: true, html: applyTokens(template, tokens) };
}

// Confirms a (farmerId, token) pair matches a real verified-token row before
// the public verify route renders anything. Returns ok:false for either
// half-mismatch (id wrong, token wrong, or both) so the caller can 404
// without leaking which half failed.
export async function lookupVerifiedFarmer(
  farmerId: string,
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!farmerId || !token) return { ok: false };
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("farmers")
    .select("id")
    .eq("id", farmerId)
    .eq("verify_token", token)
    .is("deleted_at", null)
    .maybeSingle();
  return data ? { ok: true } : { ok: false };
}
