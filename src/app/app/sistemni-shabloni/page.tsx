import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SystemTemplatesTabs from "@/components/system-templates-tabs";
import { prisma } from "@/lib/prisma";
import {
  type SectionBTemplateCardType,
} from "@/lib/section-b-template";

type SystemQuestion = {
  id: string;
  cardType: SectionBTemplateCardType;
  sectionRoman: "I" | "II" | "III" | "IV" | "V";
  questionCode: string;
  prompt: string;
  displayOrder: number;
  maxPoints: number | null;
};

type GroupedQuestions = Record<SectionBTemplateCardType, SystemQuestion[]>;

function groupQuestions(questions: SystemQuestion[]): GroupedQuestions {
  const grouped: GroupedQuestions = {
    TEACHER: [],
    EDUCATOR: [],
    DIRECTOR: [],
    DEPUTY_DIRECTOR: [],
    PSYCHOLOGIST_COUNSELOR: [],
    REHABILITATOR_TRAINER: [],
  };

  questions.forEach((question) => {
    grouped[question.cardType].push(question);
  });

  return grouped;
}

export default async function SystemTemplatesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const questions = await prisma.sectionBSystemQuestion.findMany({
    orderBy: [{ cardType: "asc" }, { displayOrder: "asc" }],
  });

  const groupedQuestions = groupQuestions(questions);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Системни шаблони</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Системни въпроси по вид карта</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Това е readonly справочникът с фиксираните системни въпроси по вид карта.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/shabloni"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Към шаблоните
            </Link>
            <Link
              href="/app/shabloni/novo"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Нов шаблон
            </Link>
          </div>
        </div>
      </header>

      <SystemTemplatesTabs groupedQuestions={groupedQuestions} />
    </main>
  );
}