'use client';

import { useEffect, useState } from 'react';
import type { RuoRepresentativeRecord } from './ruo-representatives-dashboard';

type RuoOfficeOption = {
  id: string;
  name: string;
  region: string;
};

type RuoRepresentativeFormProps = {
  representative?: RuoRepresentativeRecord | null;
  offices: RuoOfficeOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function RuoRepresentativeForm({
  representative,
  offices,
  isOpen,
  onClose,
  onSuccess,
}: RuoRepresentativeFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    ruoOfficeId: offices[0]?.id ?? '',
    userId: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (representative) {
      setFormData({
        firstName: representative.firstName,
        middleName: representative.middleName ?? '',
        lastName: representative.lastName,
        ruoOfficeId: representative.ruoOffice.id,
        userId: representative.userId ?? '',
        isActive: representative.isActive,
      });
    } else {
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        ruoOfficeId: offices[0]?.id ?? '',
        userId: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [representative, isOpen, offices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = representative ? `/api/ruo-representatives/${representative.id}` : '/api/ruo-representatives';
      const method = representative ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ submit: data.error || 'Failed to save RUO representative' });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving RUO representative:', error);
      setErrors({ submit: 'Грешка при запазване на РУО представителя' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          {representative ? 'Редактирай РУО представител' : 'Добави РУО представител'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.submit}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Име</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Презиме</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Фамилия</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">РУО офис</label>
              <select
                name="ruoOfficeId"
                value={formData.ruoOfficeId}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.ruoOfficeId ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                disabled={isSubmitting || offices.length === 0}
              >
                {offices.length === 0 ? (
                  <option value="">Няма налични РУО офиси</option>
                ) : (
                  offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name} ({office.region})
                    </option>
                  ))
                )}
              </select>
              {errors.ruoOfficeId && <p className="mt-1 text-xs text-red-600">{errors.ruoOfficeId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">UserID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Остави празно, ако няма профил"
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.userId ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                disabled={isSubmitting}
              />
              {errors.userId && <p className="mt-1 text-xs text-red-600">{errors.userId}</p>}
            </div>

            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="text-sm text-slate-700">Активен</label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Запазване...' : 'Запази'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}