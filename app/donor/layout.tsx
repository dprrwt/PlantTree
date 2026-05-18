import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared";

export const metadata = {
  title: "Your grove · PlantTree.life",
};

export default function DonorLayout({ children }: { children: ReactNode }) {
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
            signed in as <strong>donor</strong>
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
