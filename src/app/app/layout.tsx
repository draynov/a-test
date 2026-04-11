import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AppShellNav from "@/components/app-shell-nav";
import AppShellUserBar from "@/components/app-shell-user-bar";

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
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AppShellNav />

          <div className="space-y-6">
            <AppShellUserBar
              userName={session.user.name ?? session.user.email ?? "Потребител"}
              userRole={session.user.role ?? "USER"}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
