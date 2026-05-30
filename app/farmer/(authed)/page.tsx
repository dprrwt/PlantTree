import { notFound } from "next/navigation";
import { Farmer } from "@/components/screens/farmer";
import { requireFarmer } from "@/lib/auth";
import { getFarmerWorkspace } from "@/lib/db/persona-queries";

export const dynamic = "force-dynamic";

export default async function FarmerPage() {
  const profile = await requireFarmer();
  const workspace = await getFarmerWorkspace(profile.farmer_id);
  if (!workspace) notFound();
  return <Farmer workspace={workspace} />;
}
