import Link from "next/link";
import { notFound } from "next/navigation";

import {
  educationDbValueToLabel,
  type EducationLevelDb,
} from "@/lib/attestation-card";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    cardId: string;
  }>;
};

export default async function AttestationCardDetailsPage({ params }: Props) {
  const { cardId } = await params;

  const card = await prisma.attestationCard.findUnique({
    where: {
      id: cardId,
    },
  });

  if (!card) {
    notFound();
  }

  const firstInitial = educationDbValueToLabel(card.firstInitial as EducationLevelDb);
  const otherAfterInitial = card.otherAfterInitial
    ? educationDbValueToLabel(card.otherAfterInitial as EducationLevelDb)
    : "-";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Атестиране</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Преглед на атестационна карта</h1>
        <p className="mt-2 text-sm text-slate-600">Карта ID: {card.id}</p>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Раздел А</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">1. Образование</h2>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-700">1.1 Първоначална</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{firstInitial}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-700">1.2 Друга след първоначалната</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{otherAfterInitial}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-5">
          <Link
            href="/app/attestirane/karti"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            Назад към списъка
          </Link>
        </div>
      </section>
    </main>
  );
}
