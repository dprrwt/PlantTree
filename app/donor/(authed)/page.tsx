import { notFound } from "next/navigation";
import { Donor } from "@/components/screens/donor";
import { requireDonor } from "@/lib/auth";
import { getDonorGrove } from "@/lib/db/persona-queries";

export const dynamic = "force-dynamic";

export default async function DonorPage() {
  const profile = await requireDonor();
  const grove = await getDonorGrove(profile.donor_id);
  if (!grove) notFound();
  return <Donor grove={grove} />;
}
