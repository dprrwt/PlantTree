import { NextResponse } from "next/server";
import { requireDonor } from "@/lib/auth";
import { renderDonorCertificate } from "@/lib/certificates";

// Donor-only. Auth gate redirects to /donor/login if not signed in as a donor,
// and the renderer's own check rejects the request if this donor doesn't own
// the requested tree.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ treeId: string }> },
): Promise<Response> {
  const { treeId } = await ctx.params;
  const profile = await requireDonor();

  const result = await renderDonorCertificate(treeId, {
    role: "donor",
    donorId: profile.donor_id,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return new Response(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Each render is data-derived; never cache shared.
      "cache-control": "private, no-store",
    },
  });
}
