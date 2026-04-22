'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface Institution {
  id: string;
  neispuoCode: string;
  name: string;
  municipality: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface InstitutionDashboardProps {
  institutions: Institution[];
  onEdit: (institution: Institution) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function InstitutionDashboard({
  institutions,
  onEdit,
  onDelete,
  onRefresh,
}: InstitutionDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурен ли сте, че искате да изтриете тази институция?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      onDelete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert('Грешка при изтриване на институцията');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Код по НЕИСПУО
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Наименование
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Община
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Создадено
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Няма добавени институции
                </td>
              </tr>
            ) : (
              institutions.map((inst) => (
                <tr
                  key={inst.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-mono text-indigo-600">
                    {inst.neispuoCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inst.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{inst.municipality}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {format(new Date(inst.createdAt), 'dd MMM yyyy', {
                      locale: bg,
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(inst)}
                        className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
                      >
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDelete(inst.id)}
                        disabled={deletingId === inst.id}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deletingId === inst.id ? 'Изтриване...' : 'Изтрий'}
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
