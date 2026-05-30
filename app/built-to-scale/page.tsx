import { PublicTopBar } from "@/components/public-topbar";
import { Scale } from "@/components/screens/scale";

export const metadata = {
  title: "Built to scale · PlantTree.life",
  description:
    "From one tree to one crore — the scaling thesis: five invariants, six phases, four levers, one open protocol.",
};

// Deep-link / direct-URL access to the scaling manifesto. The same page also
// renders inline as a tab inside the visitor shell (app/page.tsx); here it has
// no SPA navigate, so its buttons fall back to real navigation.
export default function BuiltToScalePage() {
  return (
    <div>
      <PublicTopBar active="scale" />
      <Scale />
    </div>
  );
}
