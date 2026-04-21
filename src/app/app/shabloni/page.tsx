import { auth } from "@/auth";
import { getSectionBAdditionalCriteriaConfig, getSectionBCardTypeLabel } from "@/lib/section-b-template";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TemplatesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const templates = await prisma.sectionBTemplate.findMany({
    include: {
      customQuestions: {
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Шаблони</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Шаблони за атестация</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Тук виждаш списъка със записаните шаблони. Добавяне и редакция са на отделни екрани.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Записани шаблони: {templates.length}
            </div>
            <Link
              href="/app/sistemni-shabloni"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Системни шаблони
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
            Все още няма записани шаблони. Създай първия от бутона "Нов шаблон".
          </div>
        ) : null}

        {templates.map((template) => {
          const filledMethodologies = template.customQuestions.reduce((sum, question) => {
            return (
              sum +
              (question.scoreMethodology1.trim().length > 0 ? 1 : 0) +
              (question.scoreMethodology1_5.trim().length > 0 ? 1 : 0) +
              (question.scoreMethodology2.trim().length > 0 ? 1 : 0)
            );
          }, 0);

          const questionCount = template.customQuestions.length;
          const isMethodologyComplete = filledMethodologies === 15;
          const additionalCriteriaConfig = getSectionBAdditionalCriteriaConfig(template.cardType);

          return (
          <article key={template.id} className="rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {getSectionBCardTypeLabel(template.cardType)}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{template.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {additionalCriteriaConfig.sectionRoman}: {questionCount}/5
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Методики:</span> {filledMethodologies}/15
              </p>
              <p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isMethodologyComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {isMethodologyComplete ? "Пълни методики" : "Непълна методика"}
                </span>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Обновен</p>
              <Link
                href={`/app/shabloni/${template.id}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                Редакция
              </Link>
            </div>
          </article>
          );
        })}
      </section>
    </main>
  );
}
