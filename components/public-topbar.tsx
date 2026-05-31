import Link from "next/link";
import { Logo } from "@/components/shared";

// Lightweight top bar for the standalone public routes (/contribute, /groves)
// that live outside the single-page visitor shell in app/page.tsx. Mirrors the
// donor/admin layout bars, but with cross-links back into the rest of the site
// so every page stays one tap from every other.
export function PublicTopBar({
  active,
}: {
  active?: "contribute" | "groves" | "scale" | "why";
}) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link
          href="/"
          aria-label="Go home"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Logo />
        </Link>
        <div className="nav-links" style={{ marginLeft: 8 }}>
          {/* Links are the navigable elements directly — never <button> inside
              <Link>, which would render invalid <a><button> nesting. */}
          <Link href="/">Home</Link>
          <Link href="/why" className={active === "why" ? "active" : ""}>
            Why
          </Link>
          <Link href="/groves" className={active === "groves" ? "active" : ""}>
            Public groves
          </Link>
          <Link
            href="/contribute"
            className={active === "contribute" ? "active" : ""}
          >
            Contribute
          </Link>
          <Link
            href="/built-to-scale"
            className={active === "scale" ? "active" : ""}
          >
            Built to scale
          </Link>
        </div>
        <span
          style={{
            marginLeft: "auto",
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
          {active === "groves" ? "public groves" : "no account needed"}
        </span>
      </div>
    </div>
  );
}
