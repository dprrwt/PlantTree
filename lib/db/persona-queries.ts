// Server-only queries for the /donor and /farmer routes.
// Uses the service-role admin client to bypass RLS — acceptable during the
// pre-auth phase while the IDs are persona-locked. Before launch, swap to
// `createServerClient()` with a real session.
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  District,
  Farmer,
  Message,
  Plot,
  Thread,
  Tree,
  TreeMilestone,
  TreePhoto,
  FarmerTree,
  Earning,
} from "@/lib/data";
import { rowToPlot, type PlotRow } from "./plot-mapper";

// ---------------------------------------------------------------------------
// Display-text helpers — match the formatting baked into the test data so the
// existing screens render identically without code changes.
// ---------------------------------------------------------------------------

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "today";
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatJoined(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

const TIER_TO_KIND: Record<string, Earning["kind"]> = {
  plant_only: "plant only",
  plant_care: "plant + care",
  grove_of_5: "grove",
};

// ---------------------------------------------------------------------------
// Row → camelCase mappers (DB shape → existing lib/data.ts types)
// ---------------------------------------------------------------------------

function rowToFarmer(r: any): Farmer {
  return {
    id: r.id,
    name: r.name,
    village: r.village,
    districtId: r.district_id,
    upi: r.upi,
    phone: r.phone,
    years: r.years,
    plot: r.plot ?? "",
    quote: r.quote_original ?? r.quote_en ?? "",
    quoteEn: r.quote_en ?? "",
    plants: r.plants ?? [],
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

function rowToDistrict(r: any): District {
  return {
    id: r.id,
    name: r.name,
    elevation: r.elevation,
    x: r.x,
    y: r.y,
    summary: r.summary,
    soil: r.soil,
    rainfall: r.rainfall,
    species: r.species ?? [],
    why: r.why,
    history: r.history,
    fieldNotes: r.field_notes,
    canopy: r.canopy,
    fireRisk: r.fire_risk,
    treesPlanted: r.trees_planted,
    farmers: r.farmers_count,
    priority: r.priority,
    status: r.status,
    activeSince: r.active_since,
  };
}

function rowToMessage(r: any, photoUrl?: string): Message {
  return {
    id: r.id,
    from: r.from_role,
    time: formatMsgTime(r.created_at),
    kind: r.kind,
    text: r.text_en ?? r.text_original ?? undefined,
    caption: r.caption_en ?? r.caption_original ?? undefined,
    photoTone: r.photo_tone ?? undefined,
    photoUrl,
  };
}

// payment-proofs is a private storage bucket — to render the image in <img>
// tags in donor/farmer/operator views, we need short-lived signed URLs. One
// hour is plenty for a server-rendered page; the page reloads on navigation.
const PROOF_SIGN_TTL_SECONDS = 3600;

async function signProofUrls(
  rows: any[],
): Promise<Map<string, string>> {
  const keys = Array.from(
    new Set(
      rows
        .filter((r) => r.kind === "payment-proof" && r.photo_key)
        .map((r) => r.photo_key as string),
    ),
  );
  if (keys.length === 0) return new Map();

  const supabase = createAdminClient();
  const { data } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrls(keys, PROOF_SIGN_TTL_SECONDS);

  const m = new Map<string, string>();
  data?.forEach((entry, i) => {
    if (entry.signedUrl) m.set(keys[i], entry.signedUrl);
  });
  return m;
}

async function rowsToThread(
  treeId: string,
  farmerId: string,
  donorName: string,
  rows: any[],
): Promise<Thread> {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const proofUrls = await signProofUrls(sorted);
  const supabase = createAdminClient();
  return {
    treeId,
    donor: donorName,
    farmerId,
    messages: sorted.map((r) => {
      let photoUrl: string | undefined;
      if (r.photo_key) {
        if (r.kind === "payment-proof") {
          photoUrl = proofUrls.get(r.photo_key);
        } else if (r.kind === "photo") {
          photoUrl = supabase.storage
            .from("tree-photos")
            .getPublicUrl(r.photo_key).data.publicUrl;
        }
      }
      return rowToMessage(r, photoUrl);
    }),
  };
}

// ---------------------------------------------------------------------------
// DONOR GROVE — used by /donor
// ---------------------------------------------------------------------------

export interface DonorTree extends Tree {
  farmer: Farmer;
  district: District;
  plot: Plot | null;
  thread: Thread | null;
}

export interface DonorGrove {
  donor: {
    id: string;
    name: string;
    joined: string;
    city: string | null;
    isAnonymous: boolean;
  };
  name: string;        // mirrors existing Grove.name for screen compatibility
  joined: string;      // mirrors existing Grove.joined
  isPublic: boolean;   // grove shows in the public registry when true
  total: number;
  totalPaid: number;
  trees: DonorTree[];
}

export async function getDonorGrove(
  donorId: string,
): Promise<DonorGrove | null> {
  const supabase = createAdminClient();

  const { data: donor, error: donorError } = await supabase
    .from("donors")
    .select("id, display_name, joined_at, city, is_anonymous, is_public")
    .eq("id", donorId)
    .is("deleted_at", null)
    .maybeSingle();

  if (donorError) throw donorError;
  if (!donor) return null;

  const { data: rawTrees, error: treesError } = await supabase
    .from("trees")
    .select(`
      id, species, scientific_name, farmer_id, district_id, donor_id, plot_id,
      planted_at, stage, height_m, health_pct, last_update_at,
      farmer:farmers!farmer_id (*),
      district:districts!district_id (*),
      plot:plots!plot_id (*, farmer_plots (farmer_id, role)),
      milestones (id, label, target_date, done_at, marked_by, sort_order),
      tree_updates (id, photo_key, caption_en, caption_original, height_m, health_pct, created_at, posted_by),
      messages (id, from_role, kind, text_en, text_original, caption_en, caption_original, photo_tone, photo_key, created_at),
      donations (amount_inr, status)
    `)
    .eq("donor_id", donorId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (treesError) throw treesError;

  const donorName = donor.is_anonymous ? "Anonymous" : donor.display_name;

  const trees: DonorTree[] = await Promise.all(
    (rawTrees ?? []).map(async (t: any): Promise<DonorTree> => {
      const donation = (t.donations ?? []).find(
        (d: any) => d.status !== "refunded" && d.status !== "rejected",
      );
      const paid = donation?.amount_inr ?? 0;

      const photoBucket = createAdminClient().storage.from("tree-photos");
      // Newest first — matches the farmer's "Your updates so far" strip and
      // gives the donor "what's new on my tree?" at-a-glance instead of
      // scrolling to the right edge for the latest.
      const photos: TreePhoto[] = [...(t.tree_updates ?? [])]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .map((tu: any) => ({
          date: formatShortDate(tu.created_at),
          caption: tu.caption_en ?? tu.caption_original ?? "",
          by: t.farmer?.id ?? "",
          photoUrl: tu.photo_key
            ? photoBucket.getPublicUrl(tu.photo_key).data.publicUrl
            : undefined,
        }));

      const milestones: TreeMilestone[] = [...(t.milestones ?? [])]
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((m: any) => ({
          date: m.target_date ?? "",
          label: m.label,
          done: !!m.done_at,
          by: m.done_at ? t.farmer?.id ?? undefined : undefined,
        }));

      const thread: Thread | null =
        (t.messages ?? []).length > 0
          ? await rowsToThread(
              t.id,
              t.farmer?.id ?? "",
              donorName,
              t.messages,
            )
          : null;

      return {
        id: t.id,
        species: t.species,
        sci: t.scientific_name,
        farmerId: t.farmer_id,
        districtId: t.district_id,
        plotId: t.plot_id ?? undefined,
        planted: t.planted_at ?? "",
        paid,
        stage: t.stage as 0 | 1 | 2 | 3 | 4,
        height: Number(t.height_m ?? 0),
        health: Number(t.health_pct ?? 0),
        lastUpdate: formatRelative(t.last_update_at),
        photos,
        milestones,
        farmer: rowToFarmer(t.farmer),
        district: rowToDistrict(t.district),
        plot: t.plot ? rowToPlot(t.plot as PlotRow) : null,
        thread,
      };
    }),
  );

  const joined = formatJoined(donor.joined_at);
  const totalPaid = trees.reduce((sum, t) => sum + (t.paid ?? 0), 0);

  return {
    donor: {
      id: donor.id,
      name: donorName,
      joined,
      city: donor.city,
      isAnonymous: donor.is_anonymous,
    },
    name: donorName,
    joined,
    isPublic: !!donor.is_public,
    total: trees.length,
    totalPaid,
    trees,
  };
}

// ---------------------------------------------------------------------------
// FARMER WORKSPACE — used by /farmer
// ---------------------------------------------------------------------------

export interface FarmerThreadPreview {
  treeId: string;
  treeSpecies: string;
  donorName: string;
  lastMessageAt: string;
  unread: number;
  thread: Thread;
}

export interface FarmerWorkspace {
  farmer: Farmer;
  district: District;
  plots: Plot[];
  pendingUpdates: number;
  newMessages: number;
  trees: FarmerTree[];
  earnings: Earning[];
  threadPreviews: FarmerThreadPreview[];
}

export async function getFarmerWorkspace(
  farmerId: string,
): Promise<FarmerWorkspace | null> {
  const supabase = createAdminClient();

  const { data: farmerRow, error: farmerError } = await supabase
    .from("farmers")
    .select(`
      *,
      district:districts!district_id (*)
    `)
    .eq("id", farmerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (farmerError) throw farmerError;
  if (!farmerRow) return null;

  const farmer = rowToFarmer(farmerRow);
  const district = rowToDistrict(farmerRow.district);

  // Plots tended by this farmer (primary or co-steward).
  const { data: plotLinks, error: linksError } = await supabase
    .from("farmer_plots")
    .select("plot_id")
    .eq("farmer_id", farmerId);
  if (linksError) throw linksError;

  let plots: Plot[] = [];
  if (plotLinks && plotLinks.length > 0) {
    const plotIds = plotLinks.map((l: any) => l.plot_id);
    const { data: plotRows, error: plotsError } = await supabase
      .from("plots")
      .select(`*, farmer_plots (farmer_id, role)`)
      .in("id", plotIds)
      .is("deleted_at", null)
      .order("name");
    if (plotsError) throw plotsError;
    plots = (plotRows ?? []).map((p: any) => rowToPlot(p as PlotRow));
  }

  const { data: treeRows, error: treesError } = await supabase
    .from("trees")
    .select(`
      id, species, planted_at, height_m, health_pct, last_update_at,
      donor:donors!donor_id (display_name, is_anonymous),
      tree_updates (id, photo_key, caption_en, caption_original, height_m, health_pct, created_at, posted_by),
      messages (id, from_role, kind, text_en, text_original, caption_en, caption_original, photo_tone, photo_key, created_at)
    `)
    .eq("farmer_id", farmerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (treesError) throw treesError;

  const fourteenDaysAgo = Date.now() - 14 * 86400000;

  const farmerPhotoBucket = supabase.storage.from("tree-photos");
  const trees: FarmerTree[] = (treeRows ?? []).map((t: any) => {
    const donorDisplay = t.donor
      ? t.donor.is_anonymous
        ? "Anonymous"
        : t.donor.display_name
      : "—";
    const awaitingPlant = t.planted_at === null;
    const needsUpdate =
      !awaitingPlant &&
      (t.last_update_at === null ||
        new Date(t.last_update_at).getTime() < fourteenDaysAgo);

    const photos = [...(t.tree_updates ?? [])]
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
      .map((tu: any) => ({
        date: formatShortDate(tu.created_at),
        caption: tu.caption_en ?? tu.caption_original ?? "",
        by: farmerId,
        photoUrl: tu.photo_key
          ? farmerPhotoBucket.getPublicUrl(tu.photo_key).data.publicUrl
          : undefined,
      }));

    return {
      id: t.id,
      donor: donorDisplay,
      species: t.species,
      planted: awaitingPlant ? null : formatShortDate(t.planted_at),
      lastUpdate: awaitingPlant ? "—" : formatRelative(t.last_update_at),
      height: Number(t.height_m ?? 0),
      health: t.health_pct === null ? null : Number(t.health_pct),
      unread: 0,
      needsUpdate: needsUpdate || undefined,
      awaitingPlant: awaitingPlant || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };
  });

  const { data: donationRows, error: donationsError } = await supabase
    .from("donations")
    .select(`
      id, amount_inr, tier, tree_id, verified_at, created_at,
      donor:donors!donor_id (display_name, is_anonymous)
    `)
    .eq("farmer_id", farmerId)
    .in("status", ["verified", "awaiting_plant", "planted"])
    .order("verified_at", { ascending: false, nullsFirst: false });

  if (donationsError) throw donationsError;

  const earnings: Earning[] = (donationRows ?? []).map((d: any) => ({
    id: d.id,
    date: formatShortDate(d.verified_at ?? d.created_at),
    donor: d.donor
      ? d.donor.is_anonymous
        ? "Anonymous"
        : d.donor.display_name
      : "—",
    amount: d.amount_inr,
    tree: d.tree_id ?? "—",
    kind: TIER_TO_KIND[d.tier] ?? "plant only",
  }));

  const threadPreviews: FarmerThreadPreview[] = await Promise.all(
    (treeRows ?? [])
      .filter((t: any) => (t.messages ?? []).length > 0)
      .map(async (t: any): Promise<FarmerThreadPreview> => {
        const donorName = t.donor
          ? t.donor.is_anonymous
            ? "Anonymous"
            : t.donor.display_name
          : "—";
        const thread = await rowsToThread(
          t.id,
          farmerId,
          donorName,
          t.messages,
        );
        const lastMessageAt =
          thread.messages.length > 0
            ? thread.messages[thread.messages.length - 1].time
            : "";
        return {
          treeId: t.id,
          treeSpecies: t.species,
          donorName,
          lastMessageAt,
          unread: 0,
          thread,
        };
      }),
  );

  const pendingUpdates = trees.filter((t) => t.needsUpdate || t.awaitingPlant)
    .length;
  const newMessages = 0; // requires read-receipt tracking; defer

  return {
    farmer,
    district,
    plots,
    pendingUpdates,
    newMessages,
    trees,
    earnings,
    threadPreviews,
  };
}

// ---------------------------------------------------------------------------
// SINGLE THREAD — lazily fetched when a chat is opened
// ---------------------------------------------------------------------------

export async function getThread(treeId: string): Promise<Thread | null> {
  const supabase = createAdminClient();
  const { data: tree, error: treeError } = await supabase
    .from("trees")
    .select(`
      id, farmer_id,
      donor:donors!donor_id (display_name, is_anonymous)
    `)
    .eq("id", treeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (treeError) throw treeError;
  if (!tree) return null;

  const { data: rows, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .eq("tree_id", treeId)
    .order("created_at", { ascending: true });

  if (msgError) throw msgError;

  const donorRel: any = (tree as any).donor;
  const donorName = donorRel
    ? donorRel.is_anonymous
      ? "Anonymous"
      : donorRel.display_name
    : "—";

  return await rowsToThread(treeId, tree.farmer_id, donorName, rows ?? []);
}
