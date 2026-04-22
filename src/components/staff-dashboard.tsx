'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

export type StaffRecord = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  identifierType: 'EGN' | 'LNCH' | 'SERVICE_ID';
  identifierValue: string;
  institutionRole: 'INSTITUTION_ADMIN' | 'STAFF_MEMBER';
  isActive: boolean;
  createdAt: string | Date;
  institution: {
    id: string;
    name: string;
    neispuoCode: string;
  };
};

type StaffDashboardProps = {
  staff: StaffRecord[];
  onEdit: (staff: StaffRecord) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
};

const identifierTypeLabel: Record<StaffRecord['identifierType'], string> = {
  EGN: 'ЕГН',
  LNCH: 'ЛНЧ',
  SERVICE_ID: 'Служебен ID',
};

const institutionRoleLabel: Record<StaffRecord['institutionRole'], string> = {
  INSTITUTION_ADMIN: 'Админ на институция',
  STAFF_MEMBER: 'Служител',
};

export function StaffDashboard({ staff, onEdit, onDelete, onRefresh }: StaffDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този служител?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }

      onDelete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Грешка при изтриване на служителя');
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
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Имена</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Идентификатор</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Институция</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Функция</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Създаден</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Няма добавени служители
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{identifierTypeLabel[member.identifierType]}</div>
                    <div className="font-mono text-xs text-indigo-600">{member.identifierValue}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{member.institution.name}</div>
                    <div className="font-mono text-xs text-gray-500">{member.institution.neispuoCode}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{institutionRoleLabel[member.institutionRole]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {member.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {format(new Date(member.createdAt), 'dd MMM yyyy', { locale: bg })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(member)}
                        className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
                      >
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deletingId === member.id ? 'Изтриване...' : 'Изтрий'}
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
