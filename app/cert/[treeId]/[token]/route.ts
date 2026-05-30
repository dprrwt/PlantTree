import { NextResponse } from "next/server";
import {
  lookupVerifiedTree,
  renderDonorCertificate,
} from "@/lib/certificates";

// Public verify URL printed on the donor certificate:
//   planttree.life/cert/{treeId}/{verifyToken}
// No auth — anyone with the URL (i.e., anyone the donor showed the framed
// cert to) can confirm authenticity. Token resists enumeration; without it
// guessing PT-001, PT-002 ... would expose every tree.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ treeId: string; token: string }> },
): Promise<Response> {
  const { treeId, token } = await ctx.params;

  const match = await lookupVerifiedTree(treeId, token);
  if (!match.ok) {
    return NextResponse.json(
      { error: "Verification link is invalid." },
      { status: 404 },
    );
  }

  const result = await renderDonorCertificate(treeId, { role: "public" });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return new Response(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Public verify page is safe to cache briefly — the cert content for
      // a given (treeId, token) doesn't change.
      "cache-control": "public, max-age=300",
    },
  });
}
