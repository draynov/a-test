"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  {
    href: "/app/shabloni",
    label: "Шаблони",
    startsWith: "/app/shabloni",
  },
  {
    href: "/app/potrebiteli",
    label: "Потребители",
    startsWith: "/app/potrebiteli",
  },
  {
    href: "/app/sinhronizatsiya",
    label: "Синхронизация",
    startsWith: "/app/sinhronizatsiya",
  },
];

export default function AppShellNav() {
  const pathname = usePathname();

  return (
    <aside className="h-fit overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)] lg:sticky lg:top-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Система за атестиране</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Основни раздели</h2>

      <nav className="mt-5 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.startsWith);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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
    </aside>
  );
}
