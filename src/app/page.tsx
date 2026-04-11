import { redirect } from "next/navigation";

import AttestationCardDashboard from "@/components/attestation-card-dashboard";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <AttestationCardDashboard />;
}
