// Pure plot row → camelCase mapper. No Supabase client imports here so it can
// be used from both browser query modules and server-side query modules.
import type { Plot } from "@/lib/data";

export type PlotRow = {
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
  farmer_plots?: { farmer_id: string; role: string }[];
};

export function rowToPlot(r: PlotRow): Plot {
  const links = r.farmer_plots ?? [];
  const primary = links.find((fp) => fp.role === "primary");
  const coStewards = links.filter((fp) => fp.role === "co-steward");
  return {
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    primaryFarmerId: primary?.farmer_id ?? "",
    coFarmers: coStewards.map((fp) => fp.farmer_id),
    village: r.village,
    districtId: r.district_id,
    lat: r.lat,
    lng: r.lng,
    areaHa: Number(r.area_ha),
    elevationM: r.elevation_m,
    slopeDeg: r.slope_deg,
    aspect: r.aspect,
    waterSource: r.water_source,
    landTenure: r.land_tenure,
    panchayatVerified: r.panchayat_verified,
    soil: r.soil,
    status: r.status,
    joinedAt: r.joined_at,
    treesPlanted: r.trees_planted,
    treesAlive: r.trees_alive,
    description: r.description,
    photoTone: r.photo_tone,
  };
}
