import { createClient } from "@/lib/supabase/client";
import type { District, Farmer, Plot } from "@/lib/data";
import { rowToPlot, type PlotRow } from "./plot-mapper";

// ---------------------------------------------------------------------------
// districts
// ---------------------------------------------------------------------------

type DistrictRow = {
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
};

function rowToDistrict(r: DistrictRow): District {
  return {
    id: r.id,
    name: r.name,
    elevation: r.elevation,
    x: r.x,
    y: r.y,
    summary: r.summary,
    soil: r.soil,
    rainfall: r.rainfall,
    species: r.species,
    why: r.why,
    history: r.history,
    fieldNotes: r.field_notes,
    canopy: r.canopy,
    fireRisk: r.fire_risk,
    treesPlanted: r.trees_planted,
    farmers: r.farmers_count,
    priority: r.priority,
    status: r.status as District["status"],
    activeSince: r.active_since,
  };
}

export async function getDistricts(): Promise<District[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .neq("status", "coming_next")
    .is("deleted_at", null)
    .order("priority", { ascending: true })
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToDistrict);
}

export async function getComingNextDistricts(): Promise<
  { name: string; note: string }[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("name, summary")
    .eq("status", "coming_next")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({ name: r.name, note: r.summary }));
}

// ---------------------------------------------------------------------------
// farmers
// ---------------------------------------------------------------------------

type FarmerRow = {
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
  trees_planted: number;
  trees_alive: number;
  donors_this_year: number;
  pending_trees: number;
  farmer_plots?: { plot_id: string }[];
};

function rowToFarmer(r: FarmerRow): Farmer {
  return {
    id: r.id,
    name: r.name,
    village: r.village,
    districtId: r.district_id,
    plotIds: (r.farmer_plots ?? []).map((fp) => fp.plot_id),
    upi: r.upi,
    phone: r.phone,
    years: r.years,
    plot: r.plot ?? "",
    quote: r.quote_original ?? r.quote_en ?? "",
    quoteEn: r.quote_en ?? "",
    plants: r.plants,
    rate: r.rate,
    rateCare: r.rate_care,
    photoTone: r.photo_tone ?? "moss",
    verifiedBy: r.verified_by_org ?? "",
    treesPlanted: r.trees_planted,
    treesAlive: r.trees_alive,
    donorsThisYear: r.donors_this_year,
    pendingTrees: r.pending_trees,
  };
}

// ---------------------------------------------------------------------------
// plots
// ---------------------------------------------------------------------------

export async function getPlotsByDistrict(districtId: string): Promise<Plot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plots")
    .select(`*, farmer_plots (farmer_id, role)`)
    .eq("district_id", districtId)
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToPlot);
}

export async function getAllPlots(): Promise<Plot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plots")
    .select(`*, farmer_plots (farmer_id, role)`)
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToPlot);
}

export async function getPlot(plotId: string): Promise<Plot | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plots")
    .select(`*, farmer_plots (farmer_id, role)`)
    .eq("id", plotId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPlot(data as PlotRow) : null;
}

export async function getPlotsByFarmer(farmerId: string): Promise<Plot[]> {
  const supabase = createClient();
  const { data: links, error: linkError } = await supabase
    .from("farmer_plots")
    .select("plot_id")
    .eq("farmer_id", farmerId);
  if (linkError) throw linkError;
  if (!links || links.length === 0) return [];

  const plotIds = links.map((l) => l.plot_id);
  const { data: plots, error: plotsError } = await supabase
    .from("plots")
    .select(`*, farmer_plots (farmer_id, role)`)
    .in("id", plotIds)
    .is("deleted_at", null)
    .order("name");
  if (plotsError) throw plotsError;
  return (plots ?? []).map(rowToPlot);
}

export async function getFarmers(): Promise<Farmer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farmers")
    .select(`*, farmer_plots (plot_id)`)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToFarmer);
}
