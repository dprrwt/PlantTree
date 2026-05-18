# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

**PlantTree.life** — a philanthropic site where people pay an Indian farmer directly to plant and tend a native tree for ~20 years. Real money flows through this. The experience has to feel trustworthy and dead simple.

## Mental model: hyper-connected

Every page is connected to every other page. Treat this as one continuous experience, not a collection of screens:

- a donor on the home page is one tap from a farmer
- a farmer is one tap from their district
- a district is one tap from the trees growing there, and from the people who paid for them

Never build a screen in isolation — when you add or change anything, ask which other surfaces should link into it and out of it. Cross-links are the product.

## Design source of truth

The design in [design_extract/plant-tree-org/](design_extract/plant-tree-org/) (exported from Claude Design) is the base. **Always start there** before building or changing anything visual:

1. [design_extract/plant-tree-org/README.md](design_extract/plant-tree-org/README.md)
2. the chat transcripts in `chats/` — they show what the user actually landed on
3. `project/index.html`

New sections and components extend that design vocabulary — don't invent a new one.

## Mobile-first

Farmers and donors are mobile-only in production. Never ship a layout that only works above a desktop breakpoint.

## Commands

- `npm run dev` — start dev server (default port 3000)
- `npm run build` / `npm run start` — production
- `npm run lint` — `next lint`

No test runner is configured. To verify behavior, run `npm run dev` and exercise the screen in a browser.
