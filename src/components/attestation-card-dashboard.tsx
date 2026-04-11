"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  createEmptyAttestationCardForm,
  educationOptions,
  type AttestationCardFormData,
  type AttestationCardRecord,
} from "@/lib/attestation-card";

export default function AttestationCardDashboard() {
  const [cards, setCards] = useState<AttestationCardRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AttestationCardFormData>(createEmptyAttestationCardForm());
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [status, setStatus] = useState("Зареждане на картите...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedId) ?? null,
    [cards, selectedId],
  );

  useEffect(() => {
    void loadCards();
  }, []);

  async function loadCards() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/attestation-cards", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Нямаш достъп. Влез отново.");
        }

        throw new Error("Неуспешно зареждане на картите.");
      }

      const payload = (await response.json()) as { cards: AttestationCardRecord[] };
      setCards(payload.cards);

      if (payload.cards.length > 0) {
        const firstCard = payload.cards[0];
        setSelectedId(firstCard.id);
        setMode("edit");
        setForm({
          firstInitial: firstCard.firstInitial,
          otherAfterInitial: firstCard.otherAfterInitial ?? "",
        });
        setStatus(`Заредени са ${payload.cards.length} карти.`);
      } else {
        setSelectedId(null);
        setMode("add");
        setForm(createEmptyAttestationCardForm());
        setStatus("Няма записи. Създай първата карта.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Възникна проблем при зареждането.";
      setError(message);
      setStatus("Грешка при зареждането на картите.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNew() {
    setMode("add");
    setSelectedId(null);
    setForm(createEmptyAttestationCardForm());
    setError("");
    setStatus("Режим добавяне е активен.");
  }

  function handleSelect(card: AttestationCardRecord) {
    setMode("edit");
    setSelectedId(card.id);
    setForm({
      firstInitial: card.firstInitial,
      otherAfterInitial: card.otherAfterInitial ?? "",
    });
    setError("");
    setStatus(`Карта ${card.id} е заредена за редакция.`);
  }

  function handleCancel() {
    if (selectedCard) {
      handleSelect(selectedCard);
      return;
    }

    handleNew();
  }

  async function handleDelete(cardId: string) {
    if (!window.confirm("Сигурен ли си, че искаш да изтриеш тази карта?")) {
      return;
    }

    try {
      const response = await fetch(`/api/attestation-cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Неуспешно изтриване на картата.");
      }

      setCards((current) => current.filter((card) => card.id !== cardId));
      setStatus(`Карта ${cardId} е изтрита.`);

      const nextCards = cards.filter((card) => card.id !== cardId);
      if (nextCards.length > 0) {
        handleSelect(nextCards[0]);
      } else {
        handleNew();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Възникна проблем при изтриването.";
      setError(message);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.firstInitial) {
      setError("Поле 1.1 е задължително.");
      return;
    }

    setError("");

    try {
      if (mode === "add") {
        const response = await fetch("/api/attestation-cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Неуспешно записване на картата.");
        }

        const payload = (await response.json()) as { card: AttestationCardRecord };
        setCards((current) => [payload.card, ...current]);
        setSelectedId(payload.card.id);
        setMode("edit");
        setForm({
          firstInitial: payload.card.firstInitial,
          otherAfterInitial: payload.card.otherAfterInitial ?? "",
        });
        setStatus(`Създадена е карта ${payload.card.id}.`);
        return;
      }

      if (!selectedId) {
        throw new Error("Липсва избрана карта за редакция.");
      }

      const response = await fetch(`/api/attestation-cards/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Неуспешно обновяване на картата.");
      }

      const payload = (await response.json()) as { card: AttestationCardRecord };
      setCards((current) => current.map((card) => (card.id === payload.card.id ? payload.card : card)));
      setStatus(`Карта ${payload.card.id} е обновена.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Възникна проблем при записването.";
      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_36%,_#e2e8f0_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Атестационна карта
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Атестиране · Атестационни карти
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Списък и редакция на карти. Текущата имплементация включва Раздел А, т. 1 (1.1 и 1.2).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={handleNew}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                Нов запис
              </button>
              <button
                type="button"
                onClick={() => selectedCard && handleSelect(selectedCard)}
                disabled={!selectedCard}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Редактирай избрания
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.24)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Раздел А</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">1. Образование</h2>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {mode === "add" ? "Режим: добавяне" : "Режим: редакция"}
                </span>
              </div>
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

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Правила за т. 1</p>
                <ul className="mt-2 space-y-1 pl-4">
                  <li>• 1.1 е задължително.</li>
                  <li>• 1.2 е незадължително.</li>
                  <li>• И двете полета използват един и същ списък стойности.</li>
                </ul>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">{status}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Отказ
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {mode === "add" ? "Запиши нов запис" : "Запази промените"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <aside className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.34)]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Картите</p>
              <h3 className="mt-1 text-2xl font-semibold">Списък и редакция</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Избери карта, за да се зареди за редакция.
              </p>
            </div>

            <div className="space-y-4 px-4 py-4">
              {cards.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  Няма записани карти още.
                </div>
              ) : null}

              {cards.map((card) => {
                const isActive = card.id === selectedId;

                return (
                  <div
                    key={card.id}
                    className={`rounded-[1.5rem] border px-4 py-4 transition ${
                      isActive
                        ? "border-indigo-400 bg-white text-slate-950 shadow-lg shadow-indigo-500/10"
                        : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(card)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                            Карта #{card.id.slice(0, 8)}
                          </p>
                          <p className="mt-2 text-sm font-semibold">1.1: {card.firstInitial}</p>
                          <p className={`mt-1 text-sm ${isActive ? "text-slate-600" : "text-slate-300"}`}>
                            1.2: {card.otherAfterInitial || "-"}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-white/10 text-slate-200"}`}>
                          {isActive ? "Избрана" : "Редакция"}
                        </span>
                      </div>

                      <p className={`mt-4 text-xs ${isActive ? "text-slate-500" : "text-slate-400"}`}>
                        Актуализирана: {format(new Date(card.updatedAt), "dd.MM.yyyy HH:mm")}
                      </p>
                    </button>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelect(card)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-slate-950 text-white"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        Зареди
                      </button>
                      <Link
                        href={`/app/attestirane/karti/${card.id}`}
                        className="rounded-full bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/25"
                      >
                        Преглед
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(card.id)}
                        className="rounded-full bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25"
                      >
                        Изтрий
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
