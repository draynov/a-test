"use client";

import { signOut } from "next-auth/react";

type Props = {
  userName: string;
  userRole: string;
};

export default function AppShellUserBar({ userName, userRole }: Props) {
  return (
    <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 px-5 py-4 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{userRole}</p>
        </div>

        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="inline-flex w-fit items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
        >
          Изход
        </button>
      </div>
    </header>
  );
}
