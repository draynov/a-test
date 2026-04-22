'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

export type RuoRepresentativeRecord = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  userId: string | null;
  isActive: boolean;
  createdAt: string | Date;
  ruoOffice: {
    id: string;
    name: string;
    region: string;
  };
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
};

type RuoRepresentativeDashboardProps = {
  representatives: RuoRepresentativeRecord[];
  onEdit: (representative: RuoRepresentativeRecord) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
};

export function RuoRepresentativeDashboard({
  representatives,
  onEdit,
  onDelete,
  onRefresh,
}: RuoRepresentativeDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този РУО представител?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/ruo-representatives/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete RUO representative');
      }

      onDelete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting RUO representative:', error);
      alert('Грешка при изтриване на РУО представителя');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Имена</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">РУО офис</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">UserID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Статус</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Създаден</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {representatives.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Няма добавени РУО представители
                </td>
              </tr>
            ) : (
              representatives.map((representative) => (
                <tr key={representative.id} className="border-b border-slate-200 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {[representative.firstName, representative.middleName, representative.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{representative.ruoOffice.name}</div>
                    <div className="text-xs text-slate-500">{representative.ruoOffice.region}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {representative.userId ? (
                      <div>
                        <div className="font-mono text-xs text-indigo-600">{representative.userId}</div>
                        {representative.user && (
                          <div className="text-xs text-slate-500">
                            {representative.user.name || representative.user.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">празно</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${representative.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {representative.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {format(new Date(representative.createdAt), 'dd MMM yyyy', { locale: bg })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(representative)}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700"
                      >
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDelete(representative.id)}
                        disabled={deletingId === representative.id}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === representative.id ? 'Изтриване...' : 'Изтрий'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}