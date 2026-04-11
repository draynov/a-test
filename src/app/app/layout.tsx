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
      <AppShellUserBar
        userName={session.user.name ?? session.user.email ?? "Потребител"}
        userRole={session.user.role ?? "USER"}
      />

      <div className="grid min-h-[calc(100vh-73px)] gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="border-r border-slate-200 bg-white/90 p-4 lg:p-0">
          <AppShellNav />
        </div>

        <div className="p-4 sm:p-6 [&>main]:!max-w-none [&>main]:w-full [&>main]:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
