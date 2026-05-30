"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackInner() {
  const params = useSearchParams();
  const queryNext = params.get("next");
  const queryError = params.get("error_description") ?? params.get("error");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (queryError) {
      setError(decodeURIComponent(queryError.replace(/\+/g, " ")));
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      setError("No authentication tokens found in the URL.");
      return;
    }

    const hashParams = new URLSearchParams(hash);

    const hashError =
      hashParams.get("error_description") ?? hashParams.get("error");
    if (hashError) {
      setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
      return;
    }

    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    if (!accessToken || !refreshToken) {
      setError(
        "Missing access or refresh token. Try clicking the email link again.",
      );
      return;
    }

    // Recovery / invite flows must land on set-password so the donor sets a
    // permanent password they can use next time. Other flows respect ?next= or
    // default to /donor.
    const tokenType = hashParams.get("type");
    const isPasswordFlow =
      tokenType === "recovery" || tokenType === "invite";
    const resolvedNext = isPasswordFlow
      ? "/donor/set-password"
      : queryNext ?? "/donor";

    // @supabase/ssr's createBrowserClient defaults to flowType: 'pkce', which
    // only auto-detects ?code= query params. Supabase recovery / invite emails
    // ship implicit-flow tokens in the hash fragment, so we call setSession()
    // ourselves. This writes the auth cookies via @supabase/ssr's storage
    // adapter; the full reload to `resolvedNext` ensures server components
    // pick them up.
    const supabase = createClient();
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ data, error: sessionError }) => {
        if (sessionError || !data.session) {
          setError(
            sessionError
              ? `Could not establish session: ${sessionError.message}`
              : "Could not establish session.",
          );
          return;
        }
        window.location.replace(resolvedNext);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Session setup failed: ${msg}`);
      });
  }, [queryNext, queryError]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--paper)",
        textAlign: "center",
      }}
    >
      {error ? (
        <>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--terra)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            sign-in failed
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 22,
              color: "var(--ink-2)",
              maxWidth: 460,
              lineHeight: 1.4,
            }}
          >
            {error}
          </p>
          <a
            href="/donor/login"
            style={{
              marginTop: 22,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--moss)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ← go to login →
          </a>
        </>
      ) : (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Signing you in...
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
