# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (default port 3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — `next lint` (default ESLint config; no custom rules)

There is no test runner configured. Do not invent one — if you need to verify behavior, run `npm run dev` and exercise the screen in a browser.

## What this project is

A static, prototype-stage marketing + product site for **PlantTree.life** (pay an Indian farmer directly to plant and tend a native tree, watch it grow for ~20 years). The repo is Next.js 16 + React 19 + TypeScript, but functionally it behaves as a single-page React prototype rendered by the App Router. There is no backend, no auth, no database — all content is mock data in [lib/data.ts](lib/data.ts).

## Architecture

### Routing is in-memory, not URL-based

[app/page.tsx](app/page.tsx) is the only route. It renders [components/app.tsx](components/app.tsx), which holds two pieces of state:

- `screen: "home" | "where" | "how" | "browse" | "pick" | "donor" | "farmer" | "operator"` — which screen to show
- `role: "visitor" | "donor" | "operator"` — the viewpoint

"Navigation" is just `setScreen(...)`. There are no Next.js routes, no `<Link>`, no URL changes. The `navigate(s)` callback in `App` is passed down to every screen and is the only way to move between them.

Consequences:
- New screens require: (1) a new value in [components/screens/types.ts](components/screens/types.ts), (2) a render branch in `App`'s JSX, (3) a nav button somewhere.
- Anything URL-shaped (deep links, refresh-to-restore, share links) does not work today and would require introducing real routing.

### The role switch is a prototype-only viewpoint toggle

The pill in the top-right of `TopBar` ([components/app.tsx:199-230](components/app.tsx#L199-L230)) lets you preview the site as a visitor, donor, or farmer (operator). Changing role auto-redirects to a role-appropriate screen via the effect at [components/app.tsx:253-257](components/app.tsx#L253-L257). This is **not** real auth — it just swaps which top-bar links render and which default screen you land on.

### Mobile-first is mandatory

Both farmers and donors are mobile-only users in production. The current screens use desktop-ish grids (`gridTemplateColumns: "1.15fr 0.85fr"`, fixed pixel widths, 1280px shell). When changing or adding UI, design for narrow viewports first; never ship a layout that only works above a desktop breakpoint.

### Theming via CSS custom properties + a live Tweaks panel

All visual tokens live as CSS custom properties in [app/globals.css](app/globals.css) (`--paper`, `--ink`, `--moss`, `--terra`, `--font-display`, `--radius`, etc.). Colors use OKLCH.

[components/tweaks-panel.tsx](components/tweaks-panel.tsx) renders a floating ⚙ button that opens an in-page panel for live-editing palette / density / theme / display font. The handler in `applyTweaks` ([components/app.tsx:98-109](components/app.tsx#L98-L109)) writes those choices to `document.documentElement.style` and toggles `theme-dark` / `density-cozy` classes on `<body>`. Four named palettes (`earth`, `himalaya`, `saffron`, `indigo`) and four display fonts are wired up there — adding a new palette means adding it to `PALETTES` and to the radio options.

### Styling conventions

- Global stylesheet only ([app/globals.css](app/globals.css), ~610 lines). No CSS modules, no Tailwind, no styled-components.
- Heavy use of **inline `style={{...}}`** for component-specific layout. Shared visual primitives (buttons, chips, cards, the placeholder image) are class-based (`.btn`, `.chip`, `.card`, `.placeholder-img`).
- Display headings use `var(--font-display)` (serif); body uses `var(--font-body)` (DM Sans); metadata/eyebrow labels use `var(--font-mono)` (JetBrains Mono). The fonts are loaded via a single Google Fonts `<link>` in [app/layout.tsx](app/layout.tsx).

### Data model

Everything in [lib/data.ts](lib/data.ts). The domain types worth knowing before editing a screen:

- `District` — Uttarakhand district with restoration context (species, soil, fire risk, field notes). Drives the "Where we plant" screen and farmer location info.
- `Farmer` — a farmer profile with UPI, rates, photo tone, etc. Donors browse and pick these on the Picker screen.
- `Tree`, `Grove`, `TreePhoto`, `TreeMilestone` — what a donor sees on the Donor screen.
- `Thread`, `Message` (with `MessageKind` including system kinds `planting`/`milestone`/`thread-open`) — drives [components/messaging.tsx](components/messaging.tsx). System messages render as centered dashed pills; donor/farmer messages render as bubbles.
- `FarmerInbox`, `FarmerTree`, `Earning` — the operator/farmer workspace screen.

If you change a type here, every screen that consumes it is plain client React — there's no codegen, no schema, just TS.

### Path alias

`@/*` resolves to the repo root (see [tsconfig.json](tsconfig.json)). Use `@/components/...` and `@/lib/data` rather than relative `../../`.

### Client components everywhere

Every component file under [components/](components/) starts with `"use client"`. The only server boundary is [app/layout.tsx](app/layout.tsx) and [app/page.tsx](app/page.tsx). Don't try to use server-only APIs inside components; if you add one, it must also be a client component.

## The `design_extract/` folder

[design_extract/plant-tree-org/](design_extract/plant-tree-org/) is a handoff bundle exported from Claude Design (HTML/CSS/JS prototypes plus chat transcripts). It is excluded from TypeScript ([tsconfig.json](tsconfig.json)) and from git (`.gitignore`).

When the user asks for design work, **read [design_extract/plant-tree-org/README.md](design_extract/plant-tree-org/README.md) first**, then the chat transcripts under `chats/`, then `project/index.html`. The transcripts capture what the user actually landed on — the HTML is just the artifact. Recreate the design in the existing React structure; don't copy the prototype's DOM verbatim.
