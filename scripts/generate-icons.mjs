// Generates the PWA / home-screen icons from a single on-brand SVG source.
//
// Run with:  node scripts/generate-icons.mjs
//
// sharp ships with Next.js (used by the image optimizer), so there's no extra
// dependency to install. Edit the SVG below and re-run to regenerate every
// size. Output lands in public/icons/ and is referenced by app/manifest.ts and
// app/layout.tsx.

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Brand colours, converted from the oklch tokens in app/globals.css to hex so
// the SVG rasteriser (resvg, via sharp) renders them reliably:
//   --paper  oklch(0.965 0.012 82)  → warm cream
//   --moss   oklch(0.42 0.085 145)  → forest green
const PAPER = "#F4EFE4";
const MOSS = "#3F6A4C";

// The brand mark: the green ".dot" that sits before "PlantTree" in the topbar
// (components/shared.tsx → globals.css .brand .dot). Reproduced here as the
// app/favicon icon — a single moss-green circle on the cream paper.
//
// Full-bleed cream square so the icon works as a "maskable" icon: Android masks
// it to a circle / rounded square, so the dot is kept inside the central safe
// zone (a circle of ~80% diameter) and the cream fills every corner. r=150 on a
// 512 canvas → ~59% diameter, comfortably within that safe zone.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${PAPER}"/>
  <circle cx="256" cy="256" r="150" fill="${MOSS}"/>
</svg>
`;

const outDir = path.resolve(process.cwd(), "public", "icons");
await mkdir(outDir, { recursive: true });

// Keep a scalable copy for the favicon and any future use.
await writeFile(path.join(outDir, "icon.svg"), svg, "utf8");

// Oversample the SVG (high density) then downscale per target for crisp edges.
const source = Buffer.from(svg);
const targets = {
  "icon-192.png": 192,
  "icon-512.png": 512,
  "icon-maskable-512.png": 512,
  "apple-touch-icon.png": 180,
  "favicon-32.png": 32,
};

for (const [name, size] of Object.entries(targets)) {
  await sharp(source, { density: 288 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, name));
  console.log(`wrote public/icons/${name} (${size}×${size})`);
}

console.log("done — icons in public/icons/");
