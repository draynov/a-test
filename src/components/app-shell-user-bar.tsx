"use client";

import { signOut } from "next-auth/react";

type Props = {
  userName: string;
  userRole: string;
};

export default function AppShellUserBar({ userName, userRole }: Props) {
  return (
    <header className="w-full border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border border-slate-900 bg-slate-900" aria-hidden="true" />
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">ATesty.bg</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Платформа за атестиране</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{userRole}</p>
          </div>

          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="inline-flex w-fit items-center justify-center border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            Изход
          </button>
        </div>
      </div>
    </header>
  );
}
