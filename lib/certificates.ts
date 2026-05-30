// Server-side renderer for the donor certificate + farmer receipt HTML.
// Loads the design files from design_extract/, substitutes {{token}} markers
// with real data, returns the final HTML. The route handlers wrap this with
// auth gating + the HTTP layer.
import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Date / number formatters
// ---------------------------------------------------------------------------

const MONTHS_LONG = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LOWER = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function fmtLongDate(d: Date): string {
  return `${pad2(d.getDate())} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtLowerDate(d: Date): string {
  return `${pad2(d.getDate())} ${MONTHS_LOWER[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtShortMonth(d: Date): string {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}`;
}

function fmtTime24(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fmtVerifiedAt(d: Date): string {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${fmtTime24(d)}`;
}

function fmtVerifyPath(d: Date): string {
  return `${MONTHS_LOWER[d.getMonth()]}-${pad2(d.getDate())}`;
}

function fmtINR(amount: number): string {
  return amount.toLocaleString("en-IN");
}

// Indian-system rupees-in-words. Handles up to crores. Reasonable for any
// donation amount this app will ever see; refactor only if we ever cross
// 10^9. Lowercase, no thousands separator, no "rupees only" suffix added —
// the template's own copy supplies the surrounding language.
function rupeesInWords(amount: number): string {
  if (amount === 0) return "zero rupees only";

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
    "eighty", "ninety",
  ];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r === 0 ? tens[t] : `${tens[t]}-${ones[r]}`;
  }

  function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const r = n % 100;
    const parts: string[] = [];
    if (h > 0) parts.push(`${ones[h]} hundred`);
    if (r > 0) parts.push(twoDigits(r));
    return parts.join(" ");
  }

  let n = Math.floor(amount);
  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;
  const hundreds = n;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${twoDigits(crore)} crore`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} lakh`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} thousand`);
  if (hundreds > 0) parts.push(threeDigits(hundreds));

  return `${parts.join(" ")} rupees only`;
}

// ---------------------------------------------------------------------------
// Template loading + substitution
// ---------------------------------------------------------------------------

const TEMPLATE_DIR = path.join(
  process.cwd(),
  "design_extract",
  "caertificates and receipts",
  "handoff-certificates",
);

async function loadTemplate(filename: string): Promise<string> {
  return readFile(path.join(TEMPLATE_DIR, filename), "utf-8");
}

function applyTokens(html: string, tokens: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(tokens, key)
      ? tokens[key]
      : match;
  });
}

// ---------------------------------------------------------------------------
// Data shapes returned by Supabase joins (raw, snake_case)
// ---------------------------------------------------------------------------

interface TreeRow {
  id: string;
  species: string;
  scientific_name: string;
  farmer_id: string;
  district_id: string;
  donor_id: string | null;
  plot_id: string | null;
  planted_at: string | null;
  verify_token: string | null;
  farmer: {
    name: string;
    village: string;
    upi: string;
    years: number;
    trees_alive: number;
  } | null;
  district: { name: string } | null;
  plot: {
    name: string;
    name_en: string;
    village: string;
    area_ha: number;
    elevation_m: number;
    aspect: string | null;
    water_source: string | null;
    lat: number | null;
    lng: number | null;
  } | null;
  donor: {
    display_name: string;
    city: string | null;
    is_anonymous: boolean;
  } | null;
}

interface DonationRow {
  id: string;
  amount_inr: number;
  tier: string;
  verified_at: string | null;
  created_at: string;
  payment_method: string;
  donor_id: string;
  farmer_id: string;
  tree_id: string | null;
  status: string;
}

// Pick the "best" donation for a tree's receipt/certificate: the most-recently
// verified non-rejected one. There's usually exactly one. Fall back to most
// recent if none are verified yet.
function pickDonation(rows: DonationRow[]): DonationRow | null {
  if (rows.length === 0) return null;
  const usable = rows.filter(
    (r) => r.status !== "rejected" && r.status !== "refunded",
  );
  if (usable.length === 0) return rows[0];
  usable.sort((a, b) => {
    const av = a.verified_at ? new Date(a.verified_at).getTime() : 0;
    const bv = b.verified_at ? new Date(b.verified_at).getTime() : 0;
    if (av !== bv) return bv - av;
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
  return usable[0];
}

// ---------------------------------------------------------------------------
// Common fetch — both render fns need the same join
// ---------------------------------------------------------------------------

async function fetchTreeAndDonation(treeId: string): Promise<
  | { tree: TreeRow; donation: DonationRow | null }
  | null
> {
  const supabase = createAdminClient();

  const { data: tree, error: treeErr } = await supabase
    .from("trees")
    .select(`
      id, species, scientific_name, farmer_id, district_id, donor_id, plot_id, planted_at, verify_token,
      farmer:farmers!farmer_id (name, village, upi, years, trees_alive),
      district:districts!district_id (name),
      plot:plots!plot_id (name, name_en, village, area_ha, elevation_m, aspect, water_source, lat, lng),
      donor:donors!donor_id (display_name, city, is_anonymous)
    `)
    .eq("id", treeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (treeErr || !tree) return null;

  const { data: donations } = await supabase
    .from("donations")
    .select(
      "id, amount_inr, tier, verified_at, created_at, payment_method, donor_id, farmer_id, tree_id, status",
    )
    .eq("tree_id", treeId);

  return {
    tree: tree as unknown as TreeRow,
    donation: pickDonation((donations as DonationRow[] | null) ?? []),
  };
}

// ---------------------------------------------------------------------------
// Common derived bits used by both templates
// ---------------------------------------------------------------------------

const TIER_TO_CARE: Record<string, string> = {
  plant_only: "Plant only",
  plant_care: "Plant + 1 yr",
  grove_of_5: "Grove of 5",
};

const TIER_TO_LONG: Record<string, string> = {
  plant_only: "the planting",
  plant_care: "the planting and one-year care",
  grove_of_5: "the planting and one-year care",
};

function farmerFirstName(name: string): string {
  return name.split(" ")[0] || name;
}

// ---------------------------------------------------------------------------
// Certificate
// ---------------------------------------------------------------------------

export type RenderResult =
  | { ok: true; html: string }
  | { ok: false; status: number; message: string };

export type CertificateViewer =
  | { role: "donor"; donorId: string }
  // Public verify URLs are token-gated: the caller has already confirmed the
  // token matches this tree, so the renderer just respects donor anonymity.
  | { role: "public" };

export async function renderDonorCertificate(
  treeId: string,
  viewer: CertificateViewer,
): Promise<RenderResult> {
  const data = await fetchTreeAndDonation(treeId);
  if (!data) return { ok: false, status: 404, message: "Tree not found." };
  const { tree, donation } = data;

  if (viewer.role === "donor" && tree.donor_id !== viewer.donorId) {
    return { ok: false, status: 403, message: "Not your tree." };
  }
  if (!tree.farmer || !tree.district || !tree.donor) {
    return {
      ok: false,
      status: 422,
      message: "Tree is missing farmer/district/donor — can't issue cert.",
    };
  }

  // Public view masks anonymous donors; donor's own cert always shows their
  // real name because it's theirs.
  const showAsAnonymous = viewer.role === "public" && tree.donor.is_anonymous;
  const donorFullName = showAsAnonymous
    ? "Anonymous donor"
    : tree.donor.display_name || "Friend";
  const [donorFirst, ...rest] = donorFullName.split(" ");
  const donorLast = rest.join(" ");

  const farmer = tree.farmer;
  const district = tree.district;
  const plot = tree.plot;

  const plantedDate = tree.planted_at ? new Date(tree.planted_at) : null;
  const issuedAt = new Date();

  const tokens: Record<string, string> = {
    treeId: tree.id,
    species: tree.species,
    speciesLower: tree.species.toLowerCase(),
    sciName: tree.scientific_name,
    donorName: donorFullName,
    donorFirstName: donorFirst,
    donorLastName: donorLast,
    plotName: plot?.name ?? farmer.village,
    village: plot?.village ?? farmer.village,
    district: district.name,
    villageUpper: (plot?.village ?? farmer.village).toUpperCase(),
    districtUpper: district.name.toUpperCase(),
    elevation: plot?.elevation_m != null ? String(plot.elevation_m) : "—",
    plantedOn: plantedDate ? fmtLongDate(plantedDate) : "—",
    plantedShort: plantedDate ? fmtShortMonth(plantedDate) : "—",
    farmerName: farmer.name,
    farmerFirstName: farmerFirstName(farmer.name),
    farmerYears: String(farmer.years),
    treesAlive: String(farmer.trees_alive),
    areaHa: plot?.area_ha != null ? String(plot.area_ha) : "—",
    aspect: plot?.aspect ?? "—",
    waterSource: plot?.water_source ?? "—",
    carePlan: TIER_TO_CARE[donation?.tier ?? ""] ?? "Plant + 1 yr",
    pricePaid: donation
      ? `₹${fmtINR(donation.amount_inr)}`
      : "—",
    upiId: farmer.upi,
    lat: plot?.lat != null ? plot.lat.toFixed(3) : "—",
    lng: plot?.lng != null ? plot.lng.toFixed(3) : "—",
    issuedOnLower: fmtLowerDate(issuedAt),
    verifyToken: tree.verify_token ?? "—",
  };

  const template = await loadTemplate("donor-certificate.html");
  return { ok: true, html: applyTokens(template, tokens) };
}

// ---------------------------------------------------------------------------
// Receipt — viewable by both donor and farmer; respects anonymity for farmer
// ---------------------------------------------------------------------------

export type ReceiptViewer =
  | { role: "donor"; donorId: string }
  | { role: "farmer"; farmerId: string }
  // Public verify URLs are token-gated; the caller has already confirmed
  // the token matches.
  | { role: "public" };

export async function renderFarmerReceipt(
  treeId: string,
  viewer: ReceiptViewer,
): Promise<RenderResult> {
  const data = await fetchTreeAndDonation(treeId);
  if (!data) return { ok: false, status: 404, message: "Tree not found." };
  const { tree, donation } = data;

  if (viewer.role === "donor" && tree.donor_id !== viewer.donorId) {
    return { ok: false, status: 403, message: "Not your tree." };
  }
  if (viewer.role === "farmer" && tree.farmer_id !== viewer.farmerId) {
    return { ok: false, status: 403, message: "Not your tree." };
  }
  if (!donation) {
    return {
      ok: false,
      status: 422,
      message: "No donation yet — receipt unavailable.",
    };
  }
  if (!tree.farmer || !tree.district || !tree.donor) {
    return {
      ok: false,
      status: 422,
      message: "Receipt is missing farmer/district/donor.",
    };
  }

  const farmer = tree.farmer;
  const district = tree.district;
  const donor = tree.donor;

  // Farmer view + public view mask anonymous donors; the donor's own
  // receipt always shows their real name because it's theirs.
  const showAsAnonymous =
    (viewer.role === "farmer" || viewer.role === "public") &&
    donor.is_anonymous;
  const donorDisplay = showAsAnonymous ? "Anonymous donor" : donor.display_name;
  const donorCity = showAsAnonymous ? "—" : donor.city ?? "—";

  const paidAt = new Date(donation.created_at);
  const verifiedAt = donation.verified_at
    ? new Date(donation.verified_at)
    : paidAt;
  const issuedAt = new Date();

  // Split UPI into local + domain so the template can style @domain smaller.
  // Fall back to whole-string in local + empty domain if no @.
  const upiAt = farmer.upi.indexOf("@");
  const upiLocal = upiAt >= 0 ? farmer.upi.slice(0, upiAt) : farmer.upi;
  const upiDomain = upiAt >= 0 ? farmer.upi.slice(upiAt + 1) : "";

  const tokens: Record<string, string> = {
    treeId: tree.id,
    species: tree.species,
    speciesLower: tree.species.toLowerCase(),
    farmerName: farmer.name,
    farmerFirstName: farmerFirstName(farmer.name),
    farmerFirstNameLower: farmerFirstName(farmer.name).toLowerCase(),
    village: farmer.village,
    district: district.name,
    upiId: farmer.upi,
    upiLocal,
    upiDomain,
    amount: fmtINR(donation.amount_inr),
    amountWords: rupeesInWords(donation.amount_inr),
    donorName: donorDisplay,
    donorCity,
    paidOn: fmtLongDate(paidAt),
    paidShort: fmtShortMonth(paidAt),
    paidTime: fmtTime24(paidAt),
    verifiedAt: fmtVerifiedAt(verifiedAt),
    carePlan: TIER_TO_CARE[donation.tier] ?? "Plant + 1 yr",
    planLong: TIER_TO_LONG[donation.tier] ?? "the planting",
    verifyPath: fmtVerifyPath(paidAt),
    issuedOnLower: fmtLowerDate(issuedAt),
    verifyToken: tree.verify_token ?? "—",
  };

  const template = await loadTemplate("farmer-receipt.html");
  return { ok: true, html: applyTokens(template, tokens) };
}

// ---------------------------------------------------------------------------
// Public verify lookup — confirms the token matches a tree before the public
// route renders anything. Returns the tree id on success; null on mismatch
// so the caller can 404 without leaking which half (tree-id or token) was
// wrong.
// ---------------------------------------------------------------------------

export async function lookupVerifiedTree(
  treeId: string,
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!treeId || !token) return { ok: false };
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("trees")
    .select("id")
    .eq("id", treeId)
    .eq("verify_token", token)
    .is("deleted_at", null)
    .maybeSingle();
  return data ? { ok: true } : { ok: false };
}
