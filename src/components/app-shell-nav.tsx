"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6m-7 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Zm2-3h4a1 1 0 0 1 1 1v2h-6V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3h4l.7 2.2a7.8 7.8 0 0 1 1.8.9l2.1-1.1 2.8 2.8-1.1 2.1c.4.6.7 1.2.9 1.8L23 14v4l-2.2.7a7.8 7.8 0 0 1-.9 1.8l1.1 2.1-2.8 2.8-2.1-1.1c-.6.4-1.2.7-1.8.9L14 27h-4l-.7-2.2a7.8 7.8 0 0 1-1.8-.9l-2.1 1.1-2.8-2.8 1.1-2.1a7.8 7.8 0 0 1-.9-1.8L1 18v-4l2.2-.7c.2-.6.5-1.2.9-1.8L3 9.4 5.8 6.6 7.9 7.7c.6-.4 1.2-.7 1.8-.9L10 3Z" transform="scale(0.75) translate(4,4)" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function LayersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4 4 8l8 4 8-4-8-4ZM4 12l8 4 8-4M4 16l8 4 8-4" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 18a4 4 0 0 0-8 0m11 0a3 3 0 0 0-3-3m-8 3a3 3 0 0 1 3-3m6-7a3 3 0 1 1 0 .01M8 8a3 3 0 1 1 0 .01" />
    </svg>
  );
}

function SyncIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-5V2m-6 20v-5H4m1.5-3.5A8 8 0 0 1 15 4l0 3M18.5 10.5A8 8 0 0 1 9 20l0-3" />
    </svg>
  );
}

function BuildingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V8h2V5h8v3h2v13h2M9 13h1v4H9M14 13h1v4h-1M9 9h1v1H9M14 9h1v1h-1" />
    </svg>
  );
}

const navItems = [
  {
    href: "/app/attestirane/karti",
    label: "Атестиране",
    startsWith: "/app/attestirane",
    icon: ClipboardIcon,
  },
  {
    href: "/app/nastroiki",
    label: "Настройки",
    startsWith: "/app/nastroiki",
    icon: SettingsIcon,
  },
  {
    href: "/app/institucii",
    label: "Институции",
    startsWith: "/app/institucii",
    icon: BuildingIcon,
  },
  {
    href: "/app/staff",
    label: "Служители",
    startsWith: "/app/staff",
    icon: UsersIcon,
  },
  {
    href: "/app/shabloni",
    label: "Шаблони",
    startsWith: "/app/shabloni",
    icon: LayersIcon,
  },
  {
    href: "/app/sistemni-shabloni",
    label: "Системни шаблони",
    startsWith: "/app/sistemni-shabloni",
    icon: LayersIcon,
  },
  {
    href: "/app/potrebiteli",
    label: "Потребители",
    startsWith: "/app/potrebiteli",
    icon: UsersIcon,
  },
  {
    href: "/app/sinhronizatsiya",
    label: "Синхронизация",
    startsWith: "/app/sinhronizatsiya",
    icon: SyncIcon,
  },
];

export default function AppShellNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navContent = (
    <>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.startsWith);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
        >
          <MenuIcon className="h-4 w-4" />
          Меню
        </button>

        {isOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={() => setIsOpen(false)}>
            <aside
              className="h-full w-full max-w-xs overflow-hidden border-r border-slate-200 bg-white p-5 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center border border-slate-200 bg-white p-2 text-slate-700"
                  aria-label="Затвори менюто"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {navContent}
            </aside>
          </div>
        ) : null}
      </div>

      <aside className="hidden h-full bg-white px-5 py-6 lg:block">
        {navContent}
      </aside>
    </>
  );
}
