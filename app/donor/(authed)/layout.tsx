import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared";
import { getCurrentUser, requireDonor } from "@/lib/auth";

export const metadata = {
  title: "Your grove · PlantTree.life",
};

export default async function DonorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDonor();
  const user = await getCurrentUser();

  return (
    <div>
      <div className="topbar">
        <div className="topbar-inner">
          <Link
            href="/"
            aria-label="Go home"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Logo />
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--moss)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "1px solid var(--moss)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            your grove
          </span>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--ink-2)",
              textDecoration: "none",
            }}
          >
            Plant another →
          </Link>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {user?.email ?? "donor"}
          </span>
          {/* POST form, not a <Link>: a GET logout would be prefetched in
              production and silently sign the user out. */}
          <form
            action="/donor/logout"
            method="post"
            style={{ display: "contents" }}
          >
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--terra)",
                letterSpacing: "0.04em",
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              sign out →
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
