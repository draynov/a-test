"use client";

import { useMemo, useState } from "react";

import {
  SECTION_B_ALLOWED_CARD_TYPES,
  getSectionBCardTypeLabel,
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

type Props = {
  groupedQuestions: GroupedQuestions;
};

const SECTION_ORDER: ReadonlyArray<SystemQuestion["sectionRoman"]> = ["I", "II", "III", "IV", "V"];

export default function SystemTemplatesTabs({ groupedQuestions }: Props) {
  const defaultTab = useMemo(() => {
    return SECTION_B_ALLOWED_CARD_TYPES.find((cardType) => groupedQuestions[cardType].length > 0) ?? SECTION_B_ALLOWED_CARD_TYPES[0];
  }, [groupedQuestions]);

  const [activeTab, setActiveTab] = useState<SectionBTemplateCardType>(defaultTab);

  const activeQuestions = groupedQuestions[activeTab];

  return (
    <section className="space-y-6">
      {/* Tab Navigation */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
        <div className="flex gap-1 p-2 min-w-full">
          {SECTION_B_ALLOWED_CARD_TYPES.map((cardType) => {
            const questionsCount = groupedQuestions[cardType].length;
            const isActive = activeTab === cardType;

            return (
              <button
                key={cardType}
                onClick={() => setActiveTab(cardType)}
                className={`flex-1 min-w-max px-4 py-3 text-sm font-semibold transition-all rounded-xl whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{getSectionBCardTypeLabel(cardType)}</span>
                  <span className={`text-xs ${isActive ? "text-indigo-100" : "text-slate-500"}`}>
                    {questionsCount} въпроса
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{activeTab}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{getSectionBCardTypeLabel(activeTab)}</h2>
            <p className="mt-2 text-sm text-slate-600">{activeQuestions.length} системни въпроса</p>
          </div>

          {/* Content */}
          {activeQuestions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-600">
              <p>Засега няма заредени системни въпроси за този вид карта.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {SECTION_ORDER.map((sectionRoman) => {
                const sectionQuestions = activeQuestions.filter(
                  (question) => question.sectionRoman === sectionRoman
                );

                if (sectionQuestions.length === 0) {
                  return null;
                }

                return (
                  <div key={sectionRoman} className="space-y-4">
                    <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-3">
                      <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                        Раздел {sectionRoman}
                      </span>
                      <span className="text-sm font-medium text-slate-500">{sectionQuestions.length} въпроса</span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                      {sectionQuestions.map((question, index) => (
                        <article
                          key={question.id}
                          className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 transition hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                              <span className="text-xs font-bold text-indigo-700">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                                {question.questionCode}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
