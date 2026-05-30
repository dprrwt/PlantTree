import { NextResponse } from "next/server";
import { renderFarmerCharter } from "@/lib/charter";

// Public — the Farmer Charter is the visitor-facing trust credential linked
// from each farmer's profile. Rendered server-side from the farmer's verified
// data; never prints the actual government-ID number, only that it was checked.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ farmerId: string }> },
): Promise<Response> {
  const { farmerId } = await ctx.params;
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
      // Data-derived; safe to cache briefly at the edge per farmer.
      "cache-control": "public, max-age=300",
    },
  });
}
