"use client";

import { useEffect, useMemo, useState } from "react";

type SystemQuestion = {
  code: string;
  section: "I" | "II" | "III";
  prompt: string;
  displayOrder: number;
};

type SectionKey = SystemQuestion["section"];

type CustomQuestion = {
  id: string;
  prompt: string;
};

type ApiSystemQuestion = {
  id: string;
  cardType: "TEACHER";
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
  cardType: "TEACHER";
  scoreMethodology1: string;
  scoreMethodology1_5: string;
  scoreMethodology2: string;
  customQuestions: ApiCustomQuestion[];
  createdAt: string;
  updatedAt: string;
};

type TemplatesApiResponse = {
  templates: ApiTemplate[];
  systemQuestions: ApiSystemQuestion[];
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [systemQuestions, setSystemQuestions] = useState<SystemQuestion[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Шаблон за учител");
  const [scoreOne, setScoreOne] = useState(scoreMethodologyDefaults.one);
  const [scoreOnePointFive, setScoreOnePointFive] = useState(scoreMethodologyDefaults.onePointFive);
  const [scoreTwo, setScoreTwo] = useState(scoreMethodologyDefaults.two);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([createCustomQuestion()]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const canAddMoreCustomQuestions = customQuestions.length < 5;
  const isTemplateValid = templateName.trim().length > 0 && scoreOne.trim().length > 0 && scoreOnePointFive.trim().length > 0 && scoreTwo.trim().length > 0;

  const groupedQuestions = useMemo(() => {
    const grouped: Record<SectionKey, SystemQuestion[]> = {
      I: [],
      II: [],
      III: [],
    };

    [...systemQuestions]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .forEach((question) => {
        grouped[question.section].push(question);
      });

    return grouped;
  }, [systemQuestions]);

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/section-b/templates?cardType=TEACHER", {
          cache: "no-store",
        });

        const data = (await response.json()) as TemplatesApiResponse | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data && data.error ? data.error : "Неуспешно зареждане на шаблоните.");
        }

        if (!isMounted) {
          return;
        }

        const typedData = data as TemplatesApiResponse;
        setTemplates(typedData.templates);
        setSystemQuestions(
          typedData.systemQuestions
            .filter((question) => question.sectionRoman !== "IV")
            .map((question) => ({
              code: question.questionCode,
              section: question.sectionRoman as "I" | "II" | "III",
              prompt: question.prompt,
              displayOrder: question.displayOrder,
            })),
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Неуспешно зареждане на шаблоните.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (templates.length === 0) {
      return;
    }

    if (selectedTemplateId) {
      return;
    }

    const firstTemplate = templates[0];

    setSelectedTemplateId(firstTemplate.id);
    setTemplateName(firstTemplate.name);
    setScoreOne(firstTemplate.scoreMethodology1);
    setScoreOnePointFive(firstTemplate.scoreMethodology1_5);
    setScoreTwo(firstTemplate.scoreMethodology2);
    setCustomQuestions(
      firstTemplate.customQuestions.length > 0
        ? firstTemplate.customQuestions.map((question) => ({ id: question.id, prompt: question.prompt }))
        : [createCustomQuestion()],
    );
  }, [selectedTemplateId, templates]);

  const handleAddCustomQuestion = () => {
    if (!canAddMoreCustomQuestions) {
      return;
    }

    setCustomQuestions((current) => [...current, createCustomQuestion()]);
    setSaveMessage(null);
  };

  const handleCustomQuestionChange = (id: string, prompt: string) => {
    setCustomQuestions((current) => current.map((question) => (question.id === id ? { ...question, prompt } : question)));
    setSaveMessage(null);
  };

  const handleRemoveCustomQuestion = (id: string) => {
    setCustomQuestions((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((question) => question.id !== id);
    });
    setSaveMessage(null);
  };

  const handleSave = () => {
    if (!isTemplateValid) {
      setSaveMessage("Попълни името на шаблона и методиката за 1, 1.5 и 2.");
      return;
    }

    const payload = {
      name: templateName,
      cardType: "TEACHER" as const,
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

        const response = await fetch(
          selectedTemplateId ? `/api/section-b/templates/${selectedTemplateId}` : "/api/section-b/templates",
          {
            method: selectedTemplateId ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const data = (await response.json()) as { template?: ApiTemplate; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Записът на шаблона е неуспешен.");
        }

        const savedTemplate = data.template;

        if (!savedTemplate) {
          throw new Error("Записът на шаблона е неуспешен.");
        }

        setTemplates((current) => {
          const nextTemplates = current.filter((template) => template.id !== savedTemplate.id);
          return [savedTemplate, ...nextTemplates].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
        });
        setSelectedTemplateId(savedTemplate.id);
        setSaveMessage(
          selectedTemplateId
            ? `Шаблонът беше обновен успешно. Custom въпроси: ${savedTemplate.customQuestions.length}.`
            : `Шаблонът беше създаден успешно. Custom въпроси: ${savedTemplate.customQuestions.length}.`,
        );
      } catch (error) {
        setSaveMessage(null);
        setErrorMessage(error instanceof Error ? error.message : "Записът на шаблона е неуспешен.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleSelectTemplate = (template: ApiTemplate) => {
    setSelectedTemplateId(template.id);
    setTemplateName(template.name);
    setScoreOne(template.scoreMethodology1);
    setScoreOnePointFive(template.scoreMethodology1_5);
    setScoreTwo(template.scoreMethodology2);
    setCustomQuestions(
      template.customQuestions.length > 0
        ? template.customQuestions.map((question) => ({ id: question.id, prompt: question.prompt }))
        : [createCustomQuestion()],
    );
    setSaveMessage(`Шаблонът "${template.name}" е зареден за редакция.`);
    setErrorMessage(null);
  };

  const handleCreateNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName("Шаблон за учител");
    setScoreOne(scoreMethodologyDefaults.one);
    setScoreOnePointFive(scoreMethodologyDefaults.onePointFive);
    setScoreTwo(scoreMethodologyDefaults.two);
    setCustomQuestions([createCustomQuestion()]);
    setSaveMessage("Подготвен е нов шаблон за създаване.");
    setErrorMessage(null);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Шаблони</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Шаблон за атестация - Учител</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Този екран подготвя шаблон с фиксираните 20 системни въпроса и до 5 допълнителни custom въпроса за подраздел IV.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Системни въпроси: {systemQuestions.length}
            </div>
            <button
              type="button"
              onClick={handleCreateNewTemplate}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Нов шаблон
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <section className="overflow-hidden rounded-4xl border border-dashed border-slate-300 bg-white/80 px-6 py-8 text-sm text-slate-600">
          Зареждане на шаблони и системни въпроси...
        </section>
      ) : null}

      {errorMessage ? (
        <section className="overflow-hidden rounded-4xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {errorMessage}
        </section>
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
                Тип карта: TEACHER
              </div>
            </div>

            <div className="mt-6 grid gap-4">
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

            <p className="mt-4 text-sm text-slate-600">
              Custom въпросите се запазват като подраздел IV и се използват само за избрания шаблон.
            </p>
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
                {isSaving ? "Записване..." : selectedTemplateId ? "Обнови шаблона" : "Създай шаблона"}
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {saveMessage ?? "Избери шаблон от списъка или създай нов. Записът вече се прави през API."}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Запазени шаблони</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Списък</h2>
              <div className="mt-5 space-y-3">
                {templates.length === 0 ? (
                  <p className="text-sm text-slate-600">Все още няма създадени шаблони.</p>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                        selectedTemplateId === template.id
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">TEACHER</p>
                      <p className="mt-2 text-sm text-slate-600">Custom въпроси: {template.customQuestions.length}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Преглед</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Системни въпроси</h2>
              <p className="mt-2 text-sm text-slate-600">Това е readonly наборът от 20 фиксирани въпроса за TEACHER.</p>

              <div className="mt-5 space-y-5">
                {(["I", "II", "III"] as const).map((section) => (
                  <div key={section} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        Раздел {section}
                      </span>
                      <span className="text-sm text-slate-500">
                        {groupedQuestions[section].length} въпроса
                      </span>
                    </div>

                    <div className="space-y-3">
                      {groupedQuestions[section].map((question) => (
                        <article key={question.code} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">{question.code}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-4xl border border-indigo-100 bg-indigo-50/70 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Ориентир</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">Какво се пази в шаблона</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• Име на шаблон</li>
                <li>• Тип карта TEACHER</li>
                <li>• Методика за 1, 1.5 и 2</li>
                <li>• До 5 custom въпроса за подраздел IV</li>
                <li>• Системните 20 въпроса остават readonly</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
