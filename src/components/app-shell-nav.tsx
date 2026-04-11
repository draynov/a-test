"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  userName: string;
  userRole: string;
};

const navItems = [
  {
    href: "/app/attestirane/karti",
    label: "Атестиране",
    startsWith: "/app/attestirane",
  },
  {
    href: "/app/nastroiki",
    label: "Настройки",
    startsWith: "/app/nastroiki",
  },
];

export default function AppShellNav({ userName, userRole }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Система за атестиране</p>
            <p className="mt-1 text-sm text-slate-600">
              Влязъл: <span className="font-semibold text-slate-900">{userName}</span> ({userRole})
            </p>
          </div>

          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="inline-flex w-fit items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            Изход
          </button>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.startsWith);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
