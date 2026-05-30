import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared";
import { getCurrentUser, requireFarmer } from "@/lib/auth";

export const metadata = {
  title: "Your workspace · PlantTree.life",
};

export default async function FarmerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Gate the whole subtree; redirects to /farmer/login if not a farmer session.
  await requireFarmer();
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
            your workspace
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {user?.email ?? "farmer"}
          </span>
          <Link
            href="/farmer/logout"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--terra)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            sign out →
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
