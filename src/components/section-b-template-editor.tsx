"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  SECTION_B_CARD_TYPE_OPTIONS,
  getSectionBCardTypeLabel,
  type SectionBTemplateCardType,
} from "@/lib/section-b-template";

type MethodologyKey = "scoreMethodology1" | "scoreMethodology1_5" | "scoreMethodology2";

type CustomQuestion = {
  id: string;
  prompt: string;
  scoreMethodology1: string;
  scoreMethodology1_5: string;
  scoreMethodology2: string;
};

type ApiCustomQuestion = {
  id: string;
  templateId: string;
  sectionRoman: "IV";
  questionCode: string;
  prompt: string;
  scoreMethodology1: string;
  scoreMethodology1_5: string;
  scoreMethodology2: string;
  displayOrder: number;
};

type ApiTemplate = {
  id: string;
  name: string;
  cardType: SectionBTemplateCardType;
  customQuestions: ApiCustomQuestion[];
  createdAt: string;
  updatedAt: string;
};

type MethodologyEditorState = {
  questionIndex: number;
  key: MethodologyKey;
};

type TemplateEditorProps = {
  templateId?: string;
  title: string;
  description: string;
};

const CUSTOM_QUESTION_SLOT_COUNT = 5;

const METHODOLOGY_LABELS: Record<MethodologyKey, string> = {
  scoreMethodology1: "1",
  scoreMethodology1_5: "1.5",
  scoreMethodology2: "2",
};

function createEmptyCustomQuestion(index: number): CustomQuestion {
  return {
    id: `slot-${index + 1}`,
    prompt: "",
    scoreMethodology1: "",
    scoreMethodology1_5: "",
    scoreMethodology2: "",
  };
}

function createCustomQuestionSlots() {
  return Array.from({ length: CUSTOM_QUESTION_SLOT_COUNT }, (_, index) => createEmptyCustomQuestion(index));
}

function getMethodologyCount(question: CustomQuestion) {
  return [question.scoreMethodology1, question.scoreMethodology1_5, question.scoreMethodology2].filter((value) => value.trim().length > 0).length;
}

function getSlotIndex(question: ApiCustomQuestion) {
  const parsedCode = /^IV\.(\d+)$/.exec(question.questionCode);

  if (parsedCode) {
    const index = Number(parsedCode[1]) - 1;

    if (index >= 0 && index < CUSTOM_QUESTION_SLOT_COUNT) {
      return index;
    }
  }

  const displayOrderIndex = question.displayOrder - 1;

  if (displayOrderIndex >= 0 && displayOrderIndex < CUSTOM_QUESTION_SLOT_COUNT) {
    return displayOrderIndex;
  }

  return -1;
}

function mapApiQuestionsToSlots(questions: ApiCustomQuestion[]) {
  const slots = createCustomQuestionSlots();

  questions.forEach((question) => {
    const index = getSlotIndex(question);

    if (index === -1) {
      return;
    }

    slots[index] = {
      id: question.id,
      prompt: question.prompt,
      scoreMethodology1: question.scoreMethodology1,
      scoreMethodology1_5: question.scoreMethodology1_5,
      scoreMethodology2: question.scoreMethodology2,
    };
  });

  return slots;
}

export default function SectionBTemplateEditor({ templateId, title, description }: TemplateEditorProps) {
  const [cardType, setCardType] = useState<SectionBTemplateCardType>("TEACHER");
  const [templateName, setTemplateName] = useState("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(createCustomQuestionSlots());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeMethodologyEditor, setActiveMethodologyEditor] = useState<MethodologyEditorState | null>(null);
  const [methodologyDraft, setMethodologyDraft] = useState("");
  const [methodologyDraftDirty, setMethodologyDraftDirty] = useState(false);

  const isTemplateValid = templateName.trim().length > 0;

  const methodologySummary = useMemo(() => {
    const total = CUSTOM_QUESTION_SLOT_COUNT * 3;
    const filled = customQuestions.reduce((sum, question) => sum + getMethodologyCount(question), 0);

    return { filled, total };
  }, [customQuestions]);

  useEffect(() => {
    let isMounted = true;

    async function loadEditor() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (templateId) {
          const templateResponse = await fetch(`/api/section-b/templates/${templateId}`, { cache: "no-store" });
          const templateData = (await templateResponse.json()) as { template?: ApiTemplate; error?: string };

          if (!templateResponse.ok) {
            throw new Error(templateData.error ?? "Неуспешно зареждане на шаблона.");
          }

          const template = templateData.template;

          if (!template) {
            throw new Error("Шаблонът не е намерен.");
          }

          if (!isMounted) {
            return;
          }

          setTemplateName(template.name);
          setCardType(template.cardType);
          setCustomQuestions(mapApiQuestionsToSlots(template.customQuestions));
          setSaveMessage(`Шаблонът "${template.name}" е зареден за редакция.`);
        } else if (isMounted) {
          setTemplateName("Шаблон за учител");
          setCustomQuestions(createCustomQuestionSlots());
          setSaveMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Неуспешно зареждане на шаблона.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEditor();

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  const handleCustomQuestionChange = (index: number, prompt: string) => {
    setCustomQuestions((current) =>
      current.map((question, questionIndex) => (questionIndex === index ? { ...question, prompt } : question)),
    );
  };

  const handleCardTypeChange = (value: string) => {
    const selectedType = SECTION_B_CARD_TYPE_OPTIONS.find((option) => option.value === value);

    if (selectedType) {
      setCardType(selectedType.value);
    }
  };

  const openMethodologyEditor = (questionIndex: number, key: MethodologyKey) => {
    setActiveMethodologyEditor({ questionIndex, key });
    setMethodologyDraft(customQuestions[questionIndex][key]);
    setMethodologyDraftDirty(false);
  };

  const closeMethodologyEditor = () => {
    if (methodologyDraftDirty && !window.confirm("Има незапазени промени. Сигурен ли си, че искаш да затвориш?")) {
      return;
    }

    setActiveMethodologyEditor(null);
    setMethodologyDraft("");
    setMethodologyDraftDirty(false);
  };

  const saveMethodologyDraft = () => {
    if (!activeMethodologyEditor) {
      return;
    }

    setCustomQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === activeMethodologyEditor.questionIndex
          ? {
              ...question,
              [activeMethodologyEditor.key]: methodologyDraft,
            }
          : question,
      ),
    );

    setActiveMethodologyEditor(null);
    setMethodologyDraft("");
    setMethodologyDraftDirty(false);
  };

  const handleSave = () => {
    if (!isTemplateValid) {
      setSaveMessage("Попълни името на шаблона.");
      return;
    }

    const payload = {
      name: templateName,
      cardType,
      customQuestions: customQuestions.map((question) => ({
        prompt: question.prompt.trim(),
        sectionRoman: "IV" as const,
        scoreMethodology1: question.scoreMethodology1.trim(),
        scoreMethodology1_5: question.scoreMethodology1_5.trim(),
        scoreMethodology2: question.scoreMethodology2.trim(),
      })),
    };

    void (async () => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const response = await fetch(templateId ? `/api/section-b/templates/${templateId}` : "/api/section-b/templates", {
          method: templateId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { template?: ApiTemplate; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Записът на шаблона е неуспешен.");
        }

        if (!data.template) {
          throw new Error("Записът на шаблона е неуспешен.");
        }

        setCustomQuestions(mapApiQuestionsToSlots(data.template.customQuestions));
        setSaveMessage(templateId ? "Шаблонът беше обновен успешно." : "Шаблонът беше създаден успешно.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Записът на шаблона е неуспешен.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const activeQuestion = activeMethodologyEditor ? customQuestions[activeMethodologyEditor.questionIndex] : null;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Шаблони</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Тип карта: {getSectionBCardTypeLabel(cardType)}
            </div>
            <Link
              href="/app/sistemni-shabloni"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Системни шаблони
            </Link>
            <Link
              href="/app/shabloni"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Назад към списъка
            </Link>
          </div>
        </div>
      </header>

      {isLoading ? (
        <section className="overflow-hidden rounded-4xl border border-dashed border-slate-300 bg-white/80 px-6 py-8 text-sm text-slate-600">
          Зареждане на шаблона...
        </section>
      ) : null}

      {errorMessage ? (
        <section className="overflow-hidden rounded-4xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">{errorMessage}</section>
      ) : null}

      <div className="space-y-6">
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Настройка на шаблон</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Базови данни</h2>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Тип карта: {getSectionBCardTypeLabel(cardType)}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Вид атестационна карта</span>
              <select
                value={cardType}
                onChange={(event) => handleCardTypeChange(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {SECTION_B_CARD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Име на шаблон</span>
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="Например: Учител - основен шаблон"
              />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Custom въпроси</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Подраздел IV - 5 въпроса</h2>
              <p className="mt-2 text-sm text-slate-600">
                Всеки въпрос има скрити методики за 1, 1.5 и 2, които се редактират от pop-up.
              </p>
            </div>
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Методики: {methodologySummary.filled}/{methodologySummary.total}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {customQuestions.map((question, index) => {
              const questionMethodologyCount = getMethodologyCount(question);

              return (
                <div key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">IV.{index + 1}</p>
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          Методики {questionMethodologyCount}/3
                        </span>
                      </div>
                      <label className="mt-2 grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Съдържание на въпроса</span>
                        <input
                          value={question.prompt}
                          onChange={(event) => handleCustomQuestionChange(index, event.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          placeholder="Напиши custom въпрос за шаблона"
                        />
                      </label>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(Object.keys(METHODOLOGY_LABELS) as MethodologyKey[]).map((key) => {
                          const hasMethodology = question[key].trim().length > 0;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => openMethodologyEditor(index, key)}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                hasMethodology
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                              }`}
                            >
                              <span>{METHODOLOGY_LABELS[key]}</span>
                              <span className={`h-2 w-2 rounded-full ${hasMethodology ? "bg-emerald-500" : "bg-slate-300"}`} />
                              <span>{hasMethodology ? "Добавена" : "Празна"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-slate-600">Допълнителните въпроси не са задължителни, но слотовете са фиксирани до 5.</p>
        </section>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Запис</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Готовност на шаблона</h2>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSaving ? "Записване..." : templateId ? "Обнови шаблона" : "Създай шаблона"}
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {saveMessage ?? "Записът вече се прави през API."}
          </div>
        </section>
      </div>

      {activeMethodologyEditor && activeQuestion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.3)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Методика</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Въпрос IV.{activeMethodologyEditor.questionIndex + 1} - оценка {METHODOLOGY_LABELS[activeMethodologyEditor.key]}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{activeQuestion.prompt || "Въпросът все още е празен."}</p>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-slate-700">Текст на методиката</span>
              <textarea
                value={methodologyDraft}
                onChange={(event) => {
                  setMethodologyDraft(event.target.value);
                  setMethodologyDraftDirty(true);
                }}
                rows={7}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="Добави методика за тази оценка"
              />
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeMethodologyEditor}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                Затвори
              </button>
              <button
                type="button"
                onClick={saveMethodologyDraft}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Запази методиката
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
