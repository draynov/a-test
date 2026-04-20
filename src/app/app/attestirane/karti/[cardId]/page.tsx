import Link from "next/link";
import { notFound } from "next/navigation";

import AttestationCardEditor from "@/components/attestation-card-editor";
import { educationDbValueToLabel, type EducationLevelDb } from "@/lib/attestation-card";
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

  const editableCard = {
    id: card.id,
    firstInitial: educationDbValueToLabel(card.firstInitial as EducationLevelDb),
    otherAfterInitial: card.otherAfterInitial
      ? educationDbValueToLabel(card.otherAfterInitial as EducationLevelDb)
      : null,
    baseSpecialty: card.baseSpecialty,
    hasTeacherQualification: card.hasTeacherQualification,
    hasAdditionalQualification: card.hasAdditionalQualification,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Атестиране</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Редакция на атестационна карта</h1>
        <p className="mt-2 text-sm text-slate-600">Карта ID: {card.id}</p>
      </header>

      <AttestationCardEditor card={editableCard} mode="edit" />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/attestirane/karti"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          Назад към списъка
        </Link>
      </div>
    </main>
  );
}
