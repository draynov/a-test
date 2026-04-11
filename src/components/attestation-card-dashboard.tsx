"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { AttestationCardRecord } from "@/lib/attestation-card";

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-5V2m-6 20v-5H4m1.5-3.5A8 8 0 0 1 15 4l0 3M18.5 10.5A8 8 0 0 1 9 20l0-3" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Zm9-12 4 4" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12" />
    </svg>
  );
}

export default function AttestationCardDashboard() {
  const [cards, setCards] = useState<AttestationCardRecord[]>([]);
  const [status, setStatus] = useState("Зареждане на картите...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadCards();
  }, []);

  async function loadCards() {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch("/api/attestation-cards", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Неуспешно зареждане на картите.");
      }

      const payload = (await response.json()) as { cards: AttestationCardRecord[] };
      setCards(payload.cards);
      setStatus(payload.cards.length ? `Заредени са ${payload.cards.length} карти.` : "Няма карти. Създай първата.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неочаквана грешка.";
      setError(message);
      setStatus("Грешка при зареждането.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(cardId: string) {
    if (!window.confirm("Сигурен ли си, че искаш да изтриеш тази карта?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/attestation-cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Неуспешно изтриване на карта.");
      }

      setCards((current) => current.filter((card) => card.id !== cardId));
      setStatus(`Карта ${cardId} е изтрита.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неочаквана грешка.";
      setError(message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Атестиране</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Атестационни карти</h1>
        <p className="mt-2 text-sm text-slate-600">Списък с карти. Засега се виждат само ID и дата.</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500">{status}</span>

          <div className="flex items-center gap-2">
            <Link
              href="/app/attestirane/karti/nova"
              className="inline-flex items-center bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Нова карта
            </Link>

          <button
            type="button"
            onClick={() => void loadCards()}
            disabled={isLoading}
            className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Обнови списъка"
            title="Обнови списъка"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Дата</th>
                <th className="px-6 py-4 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                    Няма налични карти.
                  </td>
                </tr>
              ) : (
                cards.map((card) => (
                  <tr key={card.id} className="border-b border-slate-100 text-sm text-slate-700 last:border-b-0">
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{card.id}</td>
                    <td className="px-6 py-4">{format(new Date(card.createdAt), "dd.MM.yyyy HH:mm")}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/app/attestirane/karti/${card.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
                          aria-label="Редакция"
                          title="Редакция"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(card.id)}
                          className="inline-flex h-9 w-9 items-center justify-center border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                          aria-label="Изтрий"
                          title="Изтрий"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
