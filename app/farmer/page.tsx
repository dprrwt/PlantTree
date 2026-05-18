import { notFound } from "next/navigation";
import { Farmer } from "@/components/screens/farmer";
import { getFarmerWorkspace } from "@/lib/db/persona-queries";
import { PERSONA_FARMER_ID } from "@/lib/persona";

export const dynamic = "force-dynamic";

export default async function FarmerPage() {
  const workspace = await getFarmerWorkspace(PERSONA_FARMER_ID);
  if (!workspace) notFound();
  return <Farmer workspace={workspace} />;
}
