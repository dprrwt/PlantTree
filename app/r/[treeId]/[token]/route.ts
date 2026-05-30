import { NextResponse } from "next/server";
import {
  lookupVerifiedTree,
  renderFarmerReceipt,
} from "@/lib/certificates";

// Public verify URL printed on the farmer receipt:
//   planttree.life/r/{treeId}/{verifyToken}
// Same token gate as /cert. Receipt content respects donor anonymity in
// public view (renders "Anonymous donor" if the donor opted out of being
// named publicly).
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

  const result = await renderFarmerReceipt(treeId, { role: "public" });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return new Response(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
