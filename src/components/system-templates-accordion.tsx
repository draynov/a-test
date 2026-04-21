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

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
    >
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SystemTemplatesAccordion({ groupedQuestions }: Props) {
  const defaultOpenType = useMemo(() => {
    return SECTION_B_ALLOWED_CARD_TYPES.find((cardType) => groupedQuestions[cardType].length > 0) ?? SECTION_B_ALLOWED_CARD_TYPES[0];
  }, [groupedQuestions]);

  const [openCardType, setOpenCardType] = useState<SectionBTemplateCardType>(defaultOpenType);

  return (
    <section className="space-y-4">
      {SECTION_B_ALLOWED_CARD_TYPES.map((cardType) => {
        const questionsForType = groupedQuestions[cardType];
        const isOpen = openCardType === cardType;

        return (
          <article key={cardType} className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
            <button
              type="button"
              onClick={() => setOpenCardType(cardType)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{cardType}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{getSectionBCardTypeLabel(cardType)}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{questionsForType.length} въпроса</span>
                <Chevron isOpen={isOpen} />
              </div>
            </button>

            {isOpen ? (
              <div className="border-t border-slate-200 px-6 pb-6 pt-5">
                {questionsForType.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    Засега няма заредени системни въпроси за този вид карта.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {SECTION_ORDER.map((sectionRoman) => {
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
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
