import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared";

export const metadata = {
  title: "Your workspace · PlantTree.life",
};

export default function FarmerLayout({ children }: { children: ReactNode }) {
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
            signed in as <strong>farmer</strong>
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
