// Server-only queries for the operator console.
// Uses the service-role client which bypasses RLS — never import from a client component.
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OperatorSubmission {
  id: string;
  by: string;
  who: string; // resident | farmer | NGO | panchayat | other (display)
  when: string;
  adding: "plot" | "farmer" | "both";
  district: string;
  village: string;
  land: string | null;
  farmer: string | null;
  agreed: string | null;
  trust: string[];
}

const SUBMITTER_LABEL: Record<string, string> = {
  resident: "Local resident",
  farmer: "The farmer",
  ngo: "NGO / foundation",
  panchayat: "Panchayat",
  other: "Other",
};

function submissionTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// New submissions from the public /contribute form. status='new' only.
export async function getSubmissions(): Promise<OperatorSubmission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, contributor_type, contributor_name, adding, district, village, land_state, land_size, farmer_name, farmer_agreed, trust, created_at",
    )
    .eq("status", "new")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    by: row.contributor_name ?? "—",
    who: SUBMITTER_LABEL[row.contributor_type] ?? row.contributor_type ?? "—",
    when: submissionTimeAgo(row.created_at),
    adding: row.adding,
    district: row.district ?? "—",
    village: row.village ?? "—",
    land:
      [row.land_state, row.land_size].filter(Boolean).join(" · ") || null,
    farmer: row.farmer_name ?? null,
    agreed: row.farmer_agreed ?? null,
    trust: row.trust ?? [],
  }));
}

export interface OperatorTotals {
  farmers: number;
  trees: number;
  donors: number;
  totalRaisedInr: number;
  pendingVerify: number;
  overdue: number;
}

export async function getOperatorTotals(): Promise<OperatorTotals> {
  const supabase = createAdminClient();

  const [farmers, trees, donors, raised, pending, overdue] = await Promise.all([
    supabase.from("farmers").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "active"),
    supabase.from("trees").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("donors").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("donations").select("amount_inr").in("status", ["verified", "awaiting_plant", "planted"]),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("status", "pending_verify"),
    supabase.from("donations").select("*", { count: "exact", head: true }).in("status", ["awaiting_plant", "overdue"]).lt("due_plant_at", new Date().toISOString()),
  ]);

  const totalRaisedInr = (raised.data ?? []).reduce(
    (sum, row) => sum + (row.amount_inr ?? 0),
    0,
  );

  return {
    farmers: farmers.count ?? 0,
    trees: trees.count ?? 0,
    donors: donors.count ?? 0,
    totalRaisedInr,
    pendingVerify: pending.count ?? 0,
    overdue: overdue.count ?? 0,
  };
}

export interface PendingDonation {
  id: string;
  amountInr: number;
  tier: "plant_only" | "plant_care" | "grove_of_5";
  paymentMethod: string;
  paymentProofKey: string | null;
  paymentProofUrl: string | null;
  paymentRef: string | null;
  createdAt: string;
  isAnonymous: boolean;
  donorName: string;
  donorCity: string | null;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerUpi: string;
}

export async function getPendingDonations(): Promise<PendingDonation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donations")
    .select(`
      id, amount_inr, tier, payment_method, payment_proof_key, payment_ref, created_at, is_anonymous,
      donor:donors!donor_id (display_name, city),
      farmer:farmers!farmer_id (id, name, village, upi)
    `)
    .eq("status", "pending_verify")
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Sign URLs for the proof screenshots in one batch — the operator clicks
  // through these to verify and we want a thumbnail visible on the row.
  const proofKeys = (data ?? [])
    .map((r: any) => r.payment_proof_key as string | null)
    .filter((k): k is string => !!k);
  const proofUrlMap = new Map<string, string>();
  if (proofKeys.length > 0) {
    const { data: signed } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrls(proofKeys, 3600);
    signed?.forEach((entry, i) => {
      if (entry.signedUrl) proofUrlMap.set(proofKeys[i], entry.signedUrl);
    });
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    amountInr: row.amount_inr,
    tier: row.tier,
    paymentMethod: row.payment_method,
    paymentProofKey: row.payment_proof_key,
    paymentProofUrl: row.payment_proof_key
      ? proofUrlMap.get(row.payment_proof_key) ?? null
      : null,
    paymentRef: row.payment_ref,
    createdAt: row.created_at,
    isAnonymous: row.is_anonymous,
    donorName: row.donor?.display_name ?? "—",
    donorCity: row.donor?.city ?? null,
    farmerId: row.farmer?.id ?? "",
    farmerName: row.farmer?.name ?? "—",
    farmerVillage: row.farmer?.village ?? "—",
    farmerUpi: row.farmer?.upi ?? "—",
  }));
}

export interface OverdueDonation {
  id: string;
  treeId: string | null;
  treeSpecies: string | null;
  amountInr: number;
  tier: string;
  dueAt: string | null;
  dueRefundAt: string | null;
  status: string;
  donorName: string;
  farmerName: string;
  farmerPhone: string;
  daysOverdue: number;
}

export async function getOverdueDonations(): Promise<OverdueDonation[]> {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("donations")
    .select(`
      id, amount_inr, tier, status, due_plant_at, due_refund_at,
      donor:donors!donor_id (display_name),
      farmer:farmers!farmer_id (name, phone),
      tree:trees!tree_id (id, species)
    `)
    .in("status", ["awaiting_plant", "overdue"])
    .lt("due_plant_at", nowIso)
    .order("due_plant_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const due = row.due_plant_at ? new Date(row.due_plant_at) : null;
    const days = due
      ? Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      id: row.id,
      treeId: row.tree?.id ?? null,
      treeSpecies: row.tree?.species ?? null,
      amountInr: row.amount_inr,
      tier: row.tier,
      dueAt: row.due_plant_at,
      dueRefundAt: row.due_refund_at,
      status: row.status,
      donorName: row.donor?.display_name ?? "—",
      farmerName: row.farmer?.name ?? "—",
      farmerPhone: row.farmer?.phone ?? "—",
      daysOverdue: days,
    };
  });
}

export interface TreeAwaitingPhoto {
  treeId: string;
  species: string;
  plantedAt: string;
  farmerName: string;
  donorName: string;
  lastUpdateAt: string | null;
  daysSinceUpdate: number;
}

export async function getTreesAwaitingPhoto(
  daysThreshold = 14,
): Promise<TreeAwaitingPhoto[]> {
  const supabase = createAdminClient();
  const cutoff = new Date(
    Date.now() - daysThreshold * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("trees")
    .select(`
      id, species, planted_at, last_update_at,
      farmer:farmers!farmer_id (name),
      donor:donors!donor_id (display_name)
    `)
    .is("deleted_at", null)
    .not("planted_at", "is", null)
    .or(`last_update_at.lt.${cutoff},last_update_at.is.null`)
    .order("last_update_at", { ascending: true, nullsFirst: true })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const last = row.last_update_at ? new Date(row.last_update_at) : null;
    const days = last
      ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    return {
      treeId: row.id,
      species: row.species,
      plantedAt: row.planted_at,
      farmerName: row.farmer?.name ?? "—",
      donorName: row.donor?.display_name ?? "—",
      lastUpdateAt: row.last_update_at,
      daysSinceUpdate: days,
    };
  });
}

export interface OperatorFarmer {
  id: string;
  name: string;
  village: string;
  districtName: string;
  status: "active" | "pending" | "inactive";
  treesAlive: number;
  treesPlanted: number;
  pendingTrees: number;
  verifiedAt: string | null;
  verifiedByOrg: string | null;
  upi: string;
  phone: string;
  deletedAt?: string | null;
}

export interface DistrictRecord {
  id: string;
  name: string;
  elevation: string;
  x: number;
  y: number;
  summary: string;
  soil: string;
  rainfall: string;
  species: string[];
  why: string;
  history: string;
  field_notes: string;
  canopy: number;
  fire_risk: string;
  trees_planted: number;
  farmers_count: number;
  priority: "critical" | "high" | "medium";
  status: "researching" | "field-visited" | "active" | "coming_next";
  active_since: string | null;
  deleted_at: string | null;
}

export interface OperatorDistrict {
  id: string;
  name: string;
  elevation: string;
  status: DistrictRecord["status"];
  priority: DistrictRecord["priority"];
  treesPlanted: number;
  farmersCount: number;
  activeSince: string | null;
  deletedAt: string | null;
}

export async function getDistrictById(
  id: string,
): Promise<DistrictRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as DistrictRecord | null;
}

export async function getAllDistrictsIncludingDeleted(): Promise<
  OperatorDistrict[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("districts")
    .select(
      "id, name, elevation, status, priority, trees_planted, farmers_count, active_since, deleted_at",
    )
    .order("deleted_at", { ascending: true, nullsFirst: true })
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    elevation: row.elevation,
    status: row.status,
    priority: row.priority,
    treesPlanted: row.trees_planted,
    farmersCount: row.farmers_count,
    activeSince: row.active_since,
    deletedAt: row.deleted_at,
  }));
}

export interface FarmerOption {
  id: string;
  name: string;
}

export async function getAllFarmersForSelect(): Promise<FarmerOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("farmers")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []) as FarmerOption[];
}

export interface OperatorPlot {
  id: string;
  name: string;
  nameEn: string;
  village: string;
  districtName: string;
  status: "researching" | "field-visited" | "planting";
  landTenure: "private" | "van-panchayat" | "community" | "lease";
  areaHa: number;
  elevationM: number;
  treesPlanted: number;
  treesAlive: number;
  primaryFarmerName: string | null;
  coStewardCount: number;
  deletedAt: string | null;
}

export interface PlotRecord {
  id: string;
  name: string;
  name_en: string;
  village: string;
  district_id: string;
  lat: number | null;
  lng: number | null;
  area_ha: number | string;
  elevation_m: number;
  slope_deg: number;
  aspect: string | null;
  water_source: string | null;
  land_tenure: "private" | "van-panchayat" | "community" | "lease";
  panchayat_verified: boolean;
  soil: { N: number; P: number; K: number; pH: number; OM: number } | null;
  status: "researching" | "field-visited" | "planting";
  joined_at: string | null;
  trees_planted: number;
  trees_alive: number;
  description: string | null;
  photo_tone: "moss" | "terra" | "neutral" | null;
  primary_farmer_id: string | null;
  co_steward_ids: string[];
}

export async function getAllPlotsIncludingDeleted(): Promise<OperatorPlot[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plots")
    .select(`
      id, name, name_en, village, status, land_tenure, area_ha, elevation_m,
      trees_planted, trees_alive, deleted_at,
      district:districts!district_id (name),
      farmer_plots (farmer_id, role, farmer:farmers!farmer_id (name))
    `)
    .order("deleted_at", { ascending: true, nullsFirst: true })
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const links = row.farmer_plots ?? [];
    const primaryLink = links.find((l: any) => l.role === "primary");
    const coStewards = links.filter((l: any) => l.role === "co-steward");
    return {
      id: row.id,
      name: row.name,
      nameEn: row.name_en,
      village: row.village,
      districtName: row.district?.name ?? "—",
      status: row.status,
      landTenure: row.land_tenure,
      areaHa: Number(row.area_ha),
      elevationM: row.elevation_m,
      treesPlanted: row.trees_planted,
      treesAlive: row.trees_alive,
      primaryFarmerName: primaryLink?.farmer?.name ?? null,
      coStewardCount: coStewards.length,
      deletedAt: row.deleted_at,
    };
  });
}

export async function getPlotForEdit(id: string): Promise<PlotRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plots")
    .select(`*, farmer_plots (farmer_id, role)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const links = (data as any).farmer_plots ?? [];
  const primaryLink = links.find((l: any) => l.role === "primary");
  const coStewards = links.filter((l: any) => l.role === "co-steward");
  return {
    id: data.id,
    name: data.name,
    name_en: data.name_en,
    village: data.village,
    district_id: data.district_id,
    lat: data.lat,
    lng: data.lng,
    area_ha: data.area_ha,
    elevation_m: data.elevation_m,
    slope_deg: data.slope_deg,
    aspect: data.aspect,
    water_source: data.water_source,
    land_tenure: data.land_tenure,
    panchayat_verified: data.panchayat_verified,
    soil: data.soil,
    status: data.status,
    joined_at: data.joined_at,
    trees_planted: data.trees_planted,
    trees_alive: data.trees_alive,
    description: data.description,
    photo_tone: data.photo_tone,
    primary_farmer_id: primaryLink?.farmer_id ?? null,
    co_steward_ids: coStewards.map((l: any) => l.farmer_id),
  };
}

export interface DistrictOption {
  id: string;
  name: string;
}

export async function getAllDistrictsForSelect(): Promise<DistrictOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("districts")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []) as DistrictOption[];
}

export interface FarmerRecord {
  id: string;
  name: string;
  village: string;
  district_id: string;
  upi: string;
  phone: string;
  years: number;
  plot: string | null;
  quote_original: string | null;
  quote_en: string | null;
  plants: string[];
  rate: number;
  rate_care: number;
  photo_tone: "moss" | "terra" | "neutral" | null;
  verified_by_org: string | null;
  verified_at: string | null;
  status: "active" | "pending" | "inactive";
  deleted_at: string | null;
}

export interface FarmerPlotLink {
  plot_id: string;
  plot_name: string;
  plot_name_en: string;
  role: "primary" | "co-steward";
}

export type FarmerWithPlots = FarmerRecord & { plot_links: FarmerPlotLink[] };

export async function getFarmerById(
  id: string,
): Promise<FarmerWithPlots | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("farmers")
    .select(`
      *,
      farmer_plots (
        role,
        plot:plots!plot_id (id, name, name_en)
      )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const plot_links: FarmerPlotLink[] = ((data as any).farmer_plots ?? [])
    .filter((fp: any) => fp.plot)
    .map((fp: any) => ({
      plot_id: fp.plot.id,
      plot_name: fp.plot.name,
      plot_name_en: fp.plot.name_en,
      role: fp.role as "primary" | "co-steward",
    }))
    .sort((a: FarmerPlotLink, b: FarmerPlotLink) => {
      // Primary first, then alphabetical by name
      if (a.role !== b.role) return a.role === "primary" ? -1 : 1;
      return a.plot_name.localeCompare(b.plot_name);
    });

  const { farmer_plots: _drop, ...farmer } = data as any;
  return { ...(farmer as FarmerRecord), plot_links };
}

export async function getAllFarmersIncludingDeleted(): Promise<OperatorFarmer[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("farmers")
    .select(`
      id, name, village, status, trees_alive, trees_planted, pending_trees,
      verified_at, verified_by_org, upi, phone, deleted_at,
      district:districts!district_id (name)
    `)
    .order("deleted_at", { ascending: true, nullsFirst: true })
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    village: row.village,
    districtName: row.district?.name ?? "—",
    status: row.status,
    treesAlive: row.trees_alive,
    treesPlanted: row.trees_planted,
    pendingTrees: row.pending_trees,
    verifiedAt: row.verified_at,
    verifiedByOrg: row.verified_by_org,
    upi: row.upi,
    phone: row.phone,
    deletedAt: row.deleted_at,
  }));
}

export async function getAllFarmers(): Promise<OperatorFarmer[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("farmers")
    .select(`
      id, name, village, status, trees_alive, trees_planted, pending_trees,
      verified_at, verified_by_org, upi, phone,
      district:districts!district_id (name)
    `)
    .is("deleted_at", null)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    village: row.village,
    districtName: row.district?.name ?? "—",
    status: row.status,
    treesAlive: row.trees_alive,
    treesPlanted: row.trees_planted,
    pendingTrees: row.pending_trees,
    verifiedAt: row.verified_at,
    verifiedByOrg: row.verified_by_org,
    upi: row.upi,
    phone: row.phone,
  }));
}
