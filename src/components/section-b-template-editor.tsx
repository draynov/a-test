"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  SECTION_B_CARD_TYPE_OPTIONS,
  getSectionBCardTypeLabel,
  type SectionBTemplateCardType,
} from "@/lib/section-b-template";

type CustomQuestion = {
  id: string;
  prompt: string;
};

type ApiSystemQuestion = {
  id: string;
  cardType: SectionBTemplateCardType;
  sectionRoman: "I" | "II" | "III" | "IV";
  questionCode: string;
  prompt: string;
  displayOrder: number;
  maxPoints: number | null;
};

type ApiCustomQuestion = {
  id: string;
  templateId: string;
  sectionRoman: "IV";
  questionCode: string;
  prompt: string;
  displayOrder: number;
};

type ApiTemplate = {
  id: string;
  name: string;
  cardType: SectionBTemplateCardType;
  scoreMethodology1: string;
  scoreMethodology1_5: string;
  scoreMethodology2: string;
  customQuestions: ApiCustomQuestion[];
  createdAt: string;
  updatedAt: string;
};

type TemplateEditorProps = {
  templateId?: string;
  title: string;
  description: string;
};

const scoreMethodologyDefaults = {
  one: "1 - Пълно или почти пълно покриване на изискването.",
  onePointFive: "1.5 - Частично покриване на изискването с пропуски.",
  two: "2 - Покриване на изискването в пълен обем и с високо качество.",
};

function createCustomQuestion(): CustomQuestion {
  return {
    id: crypto.randomUUID(),
    prompt: "",
  };
}

export default function SectionBTemplateEditor({ templateId, title, description }: TemplateEditorProps) {
  const [cardType, setCardType] = useState<SectionBTemplateCardType>("TEACHER");
  const [templateName, setTemplateName] = useState("");
  const [scoreOne, setScoreOne] = useState(scoreMethodologyDefaults.one);
  const [scoreOnePointFive, setScoreOnePointFive] = useState(scoreMethodologyDefaults.onePointFive);
  const [scoreTwo, setScoreTwo] = useState(scoreMethodologyDefaults.two);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([createCustomQuestion()]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const canAddMoreCustomQuestions = customQuestions.length < 5;
  const isTemplateValid =
    templateName.trim().length > 0 &&
    scoreOne.trim().length > 0 &&
    scoreOnePointFive.trim().length > 0 &&
    scoreTwo.trim().length > 0;

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
          setScoreOne(template.scoreMethodology1);
          setScoreOnePointFive(template.scoreMethodology1_5);
          setScoreTwo(template.scoreMethodology2);
          setCustomQuestions(
            template.customQuestions.length > 0
              ? template.customQuestions.map((question) => ({ id: question.id, prompt: question.prompt }))
              : [createCustomQuestion()],
          );
          setSaveMessage(`Шаблонът "${template.name}" е зареден за редакция.`);
        } else {
          setTemplateName("Шаблон за учител");
          setScoreOne(scoreMethodologyDefaults.one);
          setScoreOnePointFive(scoreMethodologyDefaults.onePointFive);
          setScoreTwo(scoreMethodologyDefaults.two);
          setCustomQuestions([createCustomQuestion()]);
          setSaveMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Неуспешно зареждане на шаблона.");
          setIsLoading(false);
        }
      }
    }

    void loadEditor();

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  const handleAddCustomQuestion = () => {
    if (!canAddMoreCustomQuestions) {
      return;
    }

    setCustomQuestions((current) => [...current, createCustomQuestion()]);
  };

  const handleCustomQuestionChange = (id: string, prompt: string) => {
    setCustomQuestions((current) => current.map((question) => (question.id === id ? { ...question, prompt } : question)));
  };

  const handleCardTypeChange = (value: string) => {
    const selectedType = SECTION_B_CARD_TYPE_OPTIONS.find((option) => option.value === value);

    if (selectedType) {
      setCardType(selectedType.value);
    }
  };

  const handleRemoveCustomQuestion = (id: string) => {
    setCustomQuestions((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((question) => question.id !== id);
    });
  };

  const handleSave = () => {
    if (!isTemplateValid) {
      setSaveMessage("Попълни името на шаблона и методиката за 1, 1.5 и 2.");
      return;
    }

    const payload = {
      name: templateName,
      cardType,
      scoreMethodology1: scoreOne,
      scoreMethodology1_5: scoreOnePointFive,
      scoreMethodology2: scoreTwo,
      customQuestions: customQuestions
        .map((question) => ({ prompt: question.prompt.trim(), sectionRoman: "IV" as const }))
        .filter((question) => question.prompt.length > 0),
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

        setSaveMessage(
          templateId
            ? `Шаблонът беше обновен успешно. Custom въпроси: ${data.template.customQuestions.length}.`
            : `Шаблонът беше създаден успешно. Custom въпроси: ${data.template.customQuestions.length}.`,
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Записът на шаблона е неуспешен.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

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

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Настройка на шаблон</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Методика и базови данни</h2>
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

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Методика за 1</span>
                  <textarea
                    value={scoreOne}
                    onChange={(event) => setScoreOne(event.target.value)}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Методика за 1.5</span>
                  <textarea
                    value={scoreOnePointFive}
                    onChange={(event) => setScoreOnePointFive(event.target.value)}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Методика за 2</span>
                  <textarea
                    value={scoreTwo}
                    onChange={(event) => setScoreTwo(event.target.value)}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Custom въпроси</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Подраздел IV - до 5 въпроса</h2>
              </div>
              <button
                type="button"
                onClick={handleAddCustomQuestion}
                disabled={!canAddMoreCustomQuestions}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Добави въпрос
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {customQuestions.map((question, index) => (
                <div key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">IV.{index + 1}</p>
                      <label className="mt-2 grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Текст на въпроса</span>
                        <input
                          value={question.prompt}
                          onChange={(event) => handleCustomQuestionChange(question.id, event.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          placeholder="Напиши custom въпрос за шаблона"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustomQuestion(question.id)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                    >
                      Премахни
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-600">Custom въпросите се запазват като подраздел IV и се използват само за избрания шаблон.</p>
          </div>

          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Запис</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Готовност на шаблона</h2>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                {isSaving ? "Записване..." : templateId ? "Обнови шаблона" : "Създай шаблона"}
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {saveMessage ?? "Записът вече се прави през API."}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
