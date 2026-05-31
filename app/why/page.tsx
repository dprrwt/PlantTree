import { PublicTopBar } from "@/components/public-topbar";
import { Why } from "@/components/screens/why";

export const metadata = {
  title: "Why this · PlantTree.life",
  description:
    "When you give, where does it actually go? PlantTree takes down the wall between your money and the soil — 100% reaches the farmer, and a photo proves your tree is alive within a week.",
};

// Standalone, deep-linkable home for the "why this exists" narrative. Lives
// behind the footer's "Why we don't take your money" link and the public
// top-bar, so every public surface is one tap from the trust story.
export default function WhyPage() {
  return (
    <div>
      <PublicTopBar active="why" />
      <Why />
    </div>
  );
}
