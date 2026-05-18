import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- diagnostics that don't leak secrets ---
  const diag = {
    url_set: !!url,
    anon_set: !!anon,
    url_starts_with_https: url?.startsWith("https://") ?? false,
    url_ends_with_supabase_co: url?.endsWith(".supabase.co") ?? false,
    url_has_trailing_slash: url?.endsWith("/") ?? false,
    url_has_extra_path: !!url && /supabase\.co\/.+/.test(url),
    url_length: url?.length ?? 0,
    url_first_8: url?.slice(0, 8),
    url_last_15: url?.slice(-15),
  };

  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, error: "Missing env vars", diag },
      { status: 500 },
    );
  }

  const supabase = createClient(url, anon);
  const { data, error } = await supabase
    .from("districts")
    .select("id, name, status");

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, diag },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    district_count: data?.length ?? 0,
    districts: data,
    diag,
  });
}
