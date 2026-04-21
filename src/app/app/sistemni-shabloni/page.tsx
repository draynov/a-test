import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SECTION_B_ALLOWED_CARD_TYPES,
  getSectionBCardTypeLabel,
  type SectionBTemplateCardType,
} from "@/lib/section-b-template";

type SystemQuestion = {
  id: string;
  cardType: SectionBTemplateCardType;
  sectionRoman: "I" | "II" | "III" | "IV";
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
              Това е readonly справочникът с фиксираните системни въпроси. Засега има въпроси само за учителската карта.
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

      <section className="grid gap-4 xl:grid-cols-2">
        {SECTION_B_ALLOWED_CARD_TYPES.map((cardType) => {
          const questionsForType = groupedQuestions[cardType];

          return (
            <article key={cardType} className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{cardType}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{getSectionBCardTypeLabel(cardType)}</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {questionsForType.length} въпроса
                </span>
              </div>

              {questionsForType.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Засега няма заредени системни въпроси за този вид карта.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {(["I", "II", "III"] as const).map((sectionRoman) => {
                    const sectionQuestions = questionsForType.filter((question) => question.sectionRoman === sectionRoman);

                    if (sectionQuestions.length === 0) {
                      return null;
                    }

                    return (
                      <div key={sectionRoman} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                            Раздел {sectionRoman}
                          </span>
                          <span className="text-sm text-slate-500">{sectionQuestions.length} въпроса</span>
                        </div>

                        <div className="space-y-3">
                          {sectionQuestions.map((question) => (
                            <article key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">{question.questionCode}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}