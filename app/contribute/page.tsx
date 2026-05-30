import { PublicTopBar } from "@/components/public-topbar";
import { Contribute } from "@/components/screens/contribute";

export const metadata = {
  title: "Contribute · PlantTree.life",
  description:
    "Know land that needs trees, or a farmer who wants to plant? Tell us — no account needed.",
};

export default function ContributePage() {
  return (
    <div>
      <PublicTopBar active="contribute" />
      <Contribute />
    </div>
  );
}
