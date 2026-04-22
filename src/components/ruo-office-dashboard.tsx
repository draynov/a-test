'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

export type RuoOfficeRecord = {
  id: string;
  name: string;
  region: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type RuoOfficeDashboardProps = {
  offices: RuoOfficeRecord[];
  onEdit: (office: RuoOfficeRecord) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
};

export function RuoOfficeDashboard({ offices, onEdit, onDelete, onRefresh }: RuoOfficeDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този РУО офис?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/ruo-offices/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete RUO office');
      }

      onDelete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting RUO office:', error);
      alert('Грешка при изтриване на РУО офиса');
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Име</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Регион</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Създаден</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {offices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Няма добавени РУО офиси
                </td>
              </tr>
            ) : (
              offices.map((office) => (
                <tr key={office.id} className="border-b border-slate-200 transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{office.name}</td>
                  <td className="px-4 py-3 text-slate-700">{office.region}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {format(new Date(office.createdAt), 'dd MMM yyyy', { locale: bg })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(office)}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700"
                      >
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDelete(office.id)}
                        disabled={deletingId === office.id}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === office.id ? 'Изтриване...' : 'Изтрий'}
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