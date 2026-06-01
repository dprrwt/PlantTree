"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "./shared";
import { Landing } from "./screens/landing";
import { Where } from "./screens/where";
import { How } from "./screens/how";
import { Why } from "./screens/why";
import { Picker } from "./screens/picker";
import { Contribute } from "./screens/contribute";
import { Scale } from "./screens/scale";
import {
  TweakButton,
  TweakRadio,
  TweakSection,
  TweakSelect,
  TweaksPanel,
  useTweaks,
} from "./tweaks-panel";
import type { Role, Screen } from "./screens/types";

type Palette = "earth" | "himalaya" | "saffron" | "indigo";
type Density = "default" | "cozy";
type Theme = "light" | "dark";
type DisplayFont =
  | "Instrument Serif"
  | "DM Serif Display"
  | "Fraunces"
  | "Source Serif";

interface Tweaks {
  palette: Palette;
  density: Density;
  theme: Theme;
  displayFont: DisplayFont;
}

const DEFAULT_TWEAKS: Tweaks = {
  palette: "earth",
  density: "default",
  theme: "light",
  displayFont: "Instrument Serif",
};

const PALETTES: Record<Palette, Record<string, string>> = {
  earth: {
    "--moss": "oklch(0.42 0.085 145)",
    "--moss-soft": "oklch(0.86 0.045 140)",
    "--terra": "oklch(0.6 0.13 45)",
    "--terra-soft": "oklch(0.88 0.05 55)",
    "--amber": "oklch(0.78 0.12 80)",
    "--paper": "oklch(0.965 0.012 82)",
    "--paper-2": "oklch(0.935 0.022 78)",
    "--paper-3": "oklch(0.895 0.028 76)",
    "--ink": "oklch(0.22 0.018 60)",
  },
  himalaya: {
    "--moss": "oklch(0.4 0.09 155)",
    "--moss-soft": "oklch(0.86 0.05 150)",
    "--terra": "oklch(0.58 0.13 35)",
    "--terra-soft": "oklch(0.88 0.05 50)",
    "--amber": "oklch(0.76 0.12 85)",
    "--paper": "oklch(0.97 0.01 90)",
    "--paper-2": "oklch(0.94 0.02 95)",
    "--paper-3": "oklch(0.9 0.028 95)",
    "--ink": "oklch(0.2 0.02 130)",
  },
  saffron: {
    "--moss": "oklch(0.48 0.08 145)",
    "--moss-soft": "oklch(0.88 0.04 140)",
    "--terra": "oklch(0.62 0.16 40)",
    "--terra-soft": "oklch(0.9 0.07 50)",
    "--amber": "oklch(0.78 0.14 75)",
    "--paper": "oklch(0.965 0.018 75)",
    "--paper-2": "oklch(0.93 0.03 65)",
    "--paper-3": "oklch(0.88 0.045 60)",
    "--ink": "oklch(0.22 0.022 50)",
  },
  indigo: {
    "--moss": "oklch(0.44 0.09 155)",
    "--moss-soft": "oklch(0.84 0.05 145)",
    "--terra": "oklch(0.42 0.15 270)",
    "--terra-soft": "oklch(0.88 0.05 270)",
    "--amber": "oklch(0.76 0.1 75)",
    "--paper": "oklch(0.965 0.008 250)",
    "--paper-2": "oklch(0.93 0.018 245)",
    "--paper-3": "oklch(0.89 0.025 245)",
    "--ink": "oklch(0.22 0.025 260)",
  },
};

const FONTS: Record<DisplayFont, string> = {
  "Instrument Serif": `"Instrument Serif", Georgia, serif`,
  "DM Serif Display": `"DM Serif Display", Georgia, serif`,
  Fraunces: `"Fraunces", Georgia, serif`,
  "Source Serif": `"Source Serif 4", Georgia, serif`,
};

function applyTweaks(t: Tweaks) {
  const root = document.documentElement;
  const body = document.body;

  const p = PALETTES[t.palette] || PALETTES.earth;
  Object.entries(p).forEach(([k, v]) => root.style.setProperty(k, v));

  body.classList.toggle("theme-dark", t.theme === "dark");
  body.classList.toggle("density-cozy", t.density === "cozy");

  root.style.setProperty("--font-display", FONTS[t.displayFont] || FONTS["Instrument Serif"]);
}

const NAV_LINKS: { screen: Screen; label: string }[] = [
  { screen: "home", label: "Home" },
  { screen: "where", label: "Where we plant" },
  { screen: "how", label: "How it works" },
  { screen: "why", label: "Why" },
  { screen: "browse", label: "Farmers" },
  { screen: "contribute", label: "Contribute" },
  { screen: "scale", label: "Built to scale" },
];

function RoleSwitch({
  role,
  setRole,
  navigate,
  onPick,
  className,
}: {
  role: Role;
  setRole: (r: Role) => void;
  navigate: (s: Screen) => void;
  onPick?: () => void;
  className?: string;
}) {
  const goExternal = (href: string) => {
    if (typeof window !== "undefined") window.location.href = href;
    onPick?.();
  };
  return (
    <div
      className={`role-switch${className ? " " + className : ""}`}
      title="Prototype-only: preview the same site from 4 viewpoints"
    >
      <button
        onClick={() => {
          setRole("visitor");
          navigate("home");
          onPick?.();
        }}
        className={role === "visitor" ? "active" : ""}
      >
        visitor
      </button>
      <button onClick={() => goExternal("/donor")}>donor</button>
      <button onClick={() => goExternal("/farmer")}>farmer</button>
      <button onClick={() => goExternal("/admin")}>operator</button>
    </div>
  );
}

function TopBar({
  screen,
  navigate,
  role,
  setRole,
}: {
  screen: Screen;
  navigate: (s: Screen) => void;
  role: Role;
  setRole: (r: Role) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button
          onClick={() => {
            navigate("home");
            setMenuOpen(false);
          }}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            color: "inherit",
          }}
          aria-label="Go home"
        >
          <Logo />
        </button>

        <div className="nav-links">
          {role === "visitor" &&
            NAV_LINKS.map((l) => (
              <button
                key={l.screen}
                onClick={() => navigate(l.screen)}
                className={screen === l.screen ? "active" : ""}
              >
                {l.label}
              </button>
            ))}
        </div>

        <RoleSwitch role={role} setRole={setRole} navigate={navigate} />

        <button
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="nav-sheet">
          {NAV_LINKS.map((l) => (
            <button
              key={l.screen}
              className={`nav-sheet-link${
                screen === l.screen && role === "visitor" ? " active" : ""
              }`}
              onClick={() => {
                navigate(l.screen);
                setMenuOpen(false);
              }}
            >
              {l.label}
            </button>
          ))}
          <div className="nav-sheet-roles">
            <span className="nav-sheet-roles-label">Preview as</span>
            <RoleSwitch
              role={role}
              setRole={setRole}
              navigate={navigate}
              onPick={() => setMenuOpen(false)}
              className="role-switch-sheet"
            />
          </div>
        </nav>
      )}
    </div>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<Role>("visitor");
  const [tweaks, setTweak] = useTweaks(DEFAULT_TWEAKS);

  useEffect(() => {
    applyTweaks(tweaks);
  }, [tweaks]);

  // Catch Supabase auth tokens that landed on the root (e.g. the dashboard's
  // "Send password recovery" sets redirect to the project's Site URL). Forward
  // to /auth/callback which knows how to process the hash.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const hasAuthToken =
      hash.includes("access_token=") || hash.includes("error_description=");
    if (!hasAuthToken) return;
    const next = "/donor/set-password";
    const target = `/auth/callback?next=${encodeURIComponent(next)}${hash}`;
    window.location.replace(target);
  }, []);

  // Deep-link into a visitor screen via ?screen= — used by the standalone /why
  // page's "Meet a farmer" CTA, which can't call navigate() across the route.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("screen");
    const allowed: Screen[] = [
      "home",
      "where",
      "how",
      "why",
      "browse",
      "contribute",
      "scale",
    ];
    if (s && (allowed as string[]).includes(s)) setScreen(s as Screen);
  }, []);

  function navigate(s: Screen) {
    setScreen(s);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }

  return (
    <div>
      <TopBar
        screen={screen}
        navigate={navigate}
        role={role}
        setRole={setRole}
      />
      {screen === "home" && <Landing navigate={navigate} />}
      {screen === "where" && <Where navigate={navigate} />}
      {screen === "how" && <How navigate={navigate} />}
      {screen === "why" && <Why navigate={navigate} />}
      {(screen === "browse" || screen === "pick") && (
        <Picker navigate={navigate} />
      )}
      {screen === "contribute" && <Contribute navigate={navigate} />}
      {screen === "scale" && <Scale navigate={navigate} />}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette" subtitle="Tonal direction for the whole site">
          <TweakRadio<Palette>
            value={tweaks.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              { value: "earth", label: "Earth" },
              { value: "himalaya", label: "Himalaya" },
              { value: "saffron", label: "Saffron" },
              { value: "indigo", label: "Indigo" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Display font" subtitle="Headlines">
          <TweakSelect<DisplayFont>
            value={tweaks.displayFont}
            onChange={(v) => setTweak("displayFont", v)}
            options={[
              { value: "Instrument Serif", label: "Instrument Serif (default)" },
              { value: "DM Serif Display", label: "DM Serif Display" },
              { value: "Fraunces", label: "Fraunces" },
              { value: "Source Serif", label: "Source Serif 4" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Density">
          <TweakRadio<Density>
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "default", label: "Default" },
              { value: "cozy", label: "Cozy" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Theme">
          <TweakRadio<Theme>
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark earth" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Jump to a page">
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("home");
            }}
          >
            Home
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("where");
            }}
          >
            Where we plant
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("how");
            }}
          >
            How it works
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("why");
            }}
          >
            Why
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("browse");
            }}
          >
            Farmers
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("contribute");
            }}
          >
            Contribute
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              setRole("visitor");
              navigate("scale");
            }}
          >
            Built to scale
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/donor";
              }
            }}
          >
            Donor · my trees
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/farmer";
              }
            }}
          >
            Farmer · workspace
          </TweakButton>
          <div style={{ height: 6 }}></div>
          <TweakButton
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/admin";
              }
            }}
          >
            Operator · admin
          </TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
