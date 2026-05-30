import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { renderFarmerReceipt } from "@/lib/certificates";

// Receipts are dual-access: the tree's donor (their own payment proof) and
// the tree's farmer (their own income proof) can both fetch it. Operators
// can also see it for reconciliation.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ treeId: string }> },
): Promise<Response> {
  const { treeId } = await ctx.params;
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let viewer:
    | { role: "donor"; donorId: string }
    | { role: "farmer"; farmerId: string }
    | null = null;

  if (profile.role === "donor" && profile.donor_id) {
    viewer = { role: "donor", donorId: profile.donor_id };
  } else if (profile.role === "farmer" && profile.farmer_id) {
    viewer = { role: "farmer", farmerId: profile.farmer_id };
  }
  if (!viewer) {
    return NextResponse.json(
      { error: "Receipts are visible to donor or farmer accounts only." },
      { status: 403 },
    );
  }

  const result = await renderFarmerReceipt(treeId, viewer);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return new Response(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
