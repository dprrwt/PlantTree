import { notFound } from "next/navigation";
import { Donor } from "@/components/screens/donor";
import { getDonorGrove } from "@/lib/db/persona-queries";
import { PERSONA_DONOR_ID } from "@/lib/persona";

export const dynamic = "force-dynamic";

export default async function DonorPage() {
  const grove = await getDonorGrove(PERSONA_DONOR_ID);
  if (!grove) notFound();
  return <Donor grove={grove} />;
}
