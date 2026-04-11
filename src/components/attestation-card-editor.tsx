"use client";

import { useState } from "react";

import {
  educationOptions,
  type AttestationCardFormData,
  type AttestationCardRecord,
} from "@/lib/attestation-card";

type Props = {
  card: AttestationCardRecord;
};

export default function AttestationCardEditor({ card }: Props) {
  const [form, setForm] = useState<AttestationCardFormData>({
    firstInitial: card.firstInitial,
    otherAfterInitial: card.otherAfterInitial ?? "",
  });
  const [status, setStatus] = useState("Редактирай и запази промените.");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.firstInitial) {
      setError("Поле 1.1 е задължително.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/api/attestation-cards/${card.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Неуспешно записване.");
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Раздел А</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">1. Образование</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
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

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{status}</p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSaving ? "Записване..." : "Запази промените"}
          </button>
        </div>
      </form>
    </section>
  );
}
