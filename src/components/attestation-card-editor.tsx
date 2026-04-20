"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  BASE_SPECIALTY_MAX_LENGTH,
  createEmptyAttestationCardForm,
  getBaseSpecialtyValidationError,
  educationOptions,
  type AttestationCardFormData,
  type AttestationCardRecord,
} from "@/lib/attestation-card";

type Props = {
  card?: AttestationCardRecord;
  mode: "create" | "edit";
};

export default function AttestationCardEditor({ card, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AttestationCardFormData>(() => {
    if (card) {
      return {
        firstInitial: card.firstInitial,
        otherAfterInitial: card.otherAfterInitial ?? "",
        baseSpecialty: card.baseSpecialty ?? "",
        hasTeacherQualification: card.hasTeacherQualification,
        hasAdditionalQualification: card.hasAdditionalQualification,
      };
    }

    return createEmptyAttestationCardForm();
  });
  const [status, setStatus] = useState(
    mode === "create" ? "Попълни Раздел А и създай нова карта." : "Редактирай и запази промените.",
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.firstInitial) {
      setError("Поле 1.1 е задължително.");
      return;
    }

    const baseSpecialtyError = getBaseSpecialtyValidationError(form.baseSpecialty);

    if (baseSpecialtyError) {
      setError(baseSpecialtyError);
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const url = mode === "create" ? "/api/attestation-cards" : `/api/attestation-cards/${card?.id ?? ""}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Неуспешно записване.");
      }

      if (mode === "create") {
        const payload = (await response.json()) as { card: AttestationCardRecord };
        setStatus("Картата е създадена успешно.");
        router.push(`/app/attestirane/karti/${payload.card.id}`);
        router.refresh();
        return;
      }

      setStatus("Промените са запазени.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неочаквана грешка.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
          >
            Раздел А
          </button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Раздел А</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">1. Образование</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            1. Образование, образователно-квалификационна степен, образователна и научна степен, научна степен
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                1.1 Първоначална <span className="text-rose-500">*</span>
              </span>
              <select
                value={form.firstInitial}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstInitial: event.target.value as AttestationCardFormData["firstInitial"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Избери образование</option>
                {educationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">1.2 Друга след първоначалната</span>
              <select
                value={form.otherAfterInitial}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    otherAfterInitial: event.target.value as AttestationCardFormData["otherAfterInitial"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Няма избрана стойност</option>
                {educationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          <h3 className="text-lg font-semibold text-slate-900">2. Професионална квалификация (специалност)</h3>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              2.1 По базовата специалност от висшето образование <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              maxLength={BASE_SPECIALTY_MAX_LENGTH}
              value={form.baseSpecialty}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  baseSpecialty: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Въведи специалност"
            />
            <p className="text-xs text-slate-500">
              {form.baseSpecialty.length}/{BASE_SPECIALTY_MAX_LENGTH} символа
            </p>
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">2.2 Професионална квалификация "учител"</legend>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="hasTeacherQualification"
                  checked={form.hasTeacherQualification === true}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      hasTeacherQualification: true,
                    }))
                  }
                />
                Да
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="hasTeacherQualification"
                  checked={form.hasTeacherQualification === false}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      hasTeacherQualification: false,
                    }))
                  }
                />
                Не
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">2.3 Друга (нова/допълнителна) квалификация</legend>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="hasAdditionalQualification"
                  checked={form.hasAdditionalQualification === true}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      hasAdditionalQualification: true,
                    }))
                  }
                />
                Да
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="hasAdditionalQualification"
                  checked={form.hasAdditionalQualification === false}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      hasAdditionalQualification: false,
                    }))
                  }
                />
                Не
              </label>
            </div>
          </fieldset>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{status}</p>
          <div className="flex flex-wrap items-center gap-2">
            {mode === "create" ? (
              <Link
                href="/app/attestirane/karti"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                Отказ
              </Link>
            ) : null}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSaving ? "Записване..." : mode === "create" ? "Създай карта" : "Запази промените"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
