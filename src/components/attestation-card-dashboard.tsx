"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { AttestationCardRecord } from "@/lib/attestation-card";

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

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/app/attestirane/karti/nova"
            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Нова карта
          </Link>
          <button
            type="button"
            onClick={() => void loadCards()}
            disabled={isLoading}
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Обнови списъка
          </button>
          <span className="text-sm text-slate-500">{status}</span>
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
                <th className="px-6 py-4 font-semibold">Действия</th>
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
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/app/attestirane/karti/${card.id}`}
                          className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Редакция
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(card.id)}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Изтрий
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
