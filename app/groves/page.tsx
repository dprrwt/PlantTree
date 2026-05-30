import { PublicTopBar } from "@/components/public-topbar";
import { PublicGroves } from "@/components/screens/groves";
import { getPublicGroves } from "@/lib/db/groves-queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public groves · PlantTree.life",
  description:
    "Browse the groves of donors who chose to make their trees public — where they grow and how they're doing.",
};

export default async function GrovesPage() {
  const groves = await getPublicGroves();
  return (
    <div>
      <PublicTopBar active="groves" />
      <PublicGroves groves={groves} />
    </div>
  );
}
