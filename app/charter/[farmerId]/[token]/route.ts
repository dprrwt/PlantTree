import { NextResponse } from "next/server";
import { lookupVerifiedFarmer, renderFarmerCharter } from "@/lib/charter";

// Public verify URL printed at the bottom of the farmer charter:
//   planttree.life/charter/{farmerId}/{verifyToken}
// Anyone holding a printed charter can scan it (or, when QR codes land,
// scan the code) and confirm it was issued by us. The token gates the
// route against enumeration of /charter/<farmer-id> with guessed slugs.
//
// The pre-existing /charter/[farmerId] route stays for legacy in-app links
// (e.g. the donor's "Read the full charter →" button) — same renderer, just
// without the token check. Both surface the same HTML.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ farmerId: string; token: string }> },
): Promise<Response> {
  const { farmerId, token } = await ctx.params;

  const match = await lookupVerifiedFarmer(farmerId, token);
  if (!match.ok) {
    return NextResponse.json(
      { error: "Verification link is invalid." },
      { status: 404 },
    );
  }

  const result = await renderFarmerCharter(farmerId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return new Response(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Public verify page is safe to cache briefly — content keyed by
      // (farmerId, token) doesn't change between operator edits.
      "cache-control": "public, max-age=300",
    },
  });
}
