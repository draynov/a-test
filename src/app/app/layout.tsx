import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AppShellNav from "@/components/app-shell-nav";

type Props = {
  children: ReactNode;
};

export default async function ProtectedAppLayout({ children }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_36%,_#e2e8f0_100%)] text-slate-900">
      <AppShellNav
        userName={session.user.name ?? session.user.email ?? "Потребител"}
        userRole={session.user.role ?? "USER"}
      />
      <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-10">{children}</div>
    </div>
  );
}
