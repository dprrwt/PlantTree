// Server-only queries for the public grove registry (/groves).
// Uses the service-role admin client like the other persona queries during the
// pre-auth phase. The SELECT here is deliberately narrow: it exposes ONLY
// tree/growth fields and the donor's display name + join date — never email,
// phone, city, receipts, or message threads.
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

function formatJoined(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export interface PublicGroveTree {
  id: string;
  species: string;
  sci: string;
  districtName: string;
  stage: 0 | 1 | 2 | 3 | 4;
  height: number;
  farmerFirstName: string;
}

export interface PublicGrove {
  id: string;
  name: string;
  joined: string;
  trees: number;
  districts: number;
  blurb: string;
  isYou: boolean;
  treeList: PublicGroveTree[];
}

// A pleasant, deterministic one-liner for the card/detail — donors don't have a
// free-text blurb column and we don't want to add speculative scaffolding.
function buildBlurb(treeCount: number, districtCount: number): string {
  if (treeCount === 0) return "Just getting started — first tree on the way.";
  const t = `${treeCount} ${treeCount === 1 ? "tree" : "trees"}`;
  const d = `${districtCount} ${districtCount === 1 ? "district" : "districts"}`;
  return `${t} growing across ${d} of the Uttarakhand hills.`;
}

export async function getPublicGroves(): Promise<PublicGrove[]> {
  const supabase = createAdminClient();

  const { data: donors, error: donorsErr } = await supabase
    .from("donors")
    .select("id, display_name, joined_at, is_anonymous")
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("joined_at", { ascending: true });
  if (donorsErr) throw donorsErr;
  if (!donors || donors.length === 0) return [];

  const { data: trees, error: treesErr } = await supabase
    .from("trees")
    .select(`
      id, species, scientific_name, donor_id, stage, height_m,
      district:districts!district_id (name),
      farmer:farmers!farmer_id (name)
    `)
    .in("donor_id", donors.map((d) => d.id))
    .eq("visibility", "public")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (treesErr) throw treesErr;

  const byDonor = new Map<string, PublicGroveTree[]>();
  for (const t of trees ?? []) {
    const row = t as any;
    const list = byDonor.get(row.donor_id) ?? [];
    list.push({
      id: row.id,
      species: row.species,
      sci: row.scientific_name,
      districtName: row.district?.name ?? "—",
      stage: row.stage as 0 | 1 | 2 | 3 | 4,
      height: Number(row.height_m ?? 0),
      farmerFirstName: (row.farmer?.name ?? "—").split(" ")[0],
    });
    byDonor.set(row.donor_id, list);
  }

  return donors.map((d) => {
    const treeList = byDonor.get(d.id) ?? [];
    const districtCount = new Set(treeList.map((t) => t.districtName)).size;
    return {
      id: d.id,
      name: d.is_anonymous ? "Anonymous" : d.display_name,
      joined: formatJoined(d.joined_at),
      trees: treeList.length,
      districts: districtCount,
      blurb: buildBlurb(treeList.length, districtCount),
      isYou: false,
      treeList,
    };
  });
}
