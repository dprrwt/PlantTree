import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared";
import { getCurrentUser, requireOperator } from "@/lib/auth";

export const metadata = {
  title: "Operator console · PlantTree.life",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Gate every authed admin page in one place; redirects to /admin/login if not operator.
  await requireOperator();
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
              color: "var(--terra)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "1px solid var(--terra)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            operator console
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {user?.email ?? "operator"}
          </span>
          {/* POST form, not a <Link>: a GET logout would be prefetched in
              production and silently sign the user out. */}
          <form
            action="/admin/logout"
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
