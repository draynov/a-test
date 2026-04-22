'use client';

import { useEffect, useState } from 'react';
import type { RuoOfficeRecord } from './ruo-office-dashboard';

type RuoOfficeFormProps = {
  office?: RuoOfficeRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function RuoOfficeForm({ office, isOpen, onClose, onSuccess }: RuoOfficeFormProps) {
  const [formData, setFormData] = useState({ name: '', region: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (office) {
      setFormData({ name: office.name, region: office.region });
    } else {
      setFormData({ name: '', region: '' });
    }
    setErrors({});
  }, [office, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = office ? `/api/ruo-offices/${office.id}` : '/api/ruo-offices';
      const method = office ? 'PUT' : 'POST';

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
          setErrors({ submit: data.error || 'Failed to save RUO office' });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving RUO office:', error);
      setErrors({ submit: 'Грешка при запазване на РУО офиса' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">{office ? 'Редактирай РУО офис' : 'Добави РУО офис'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.submit}</div>}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Име</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Регион</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.region ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
              disabled={isSubmitting}
            />
            {errors.region && <p className="mt-1 text-xs text-red-600">{errors.region}</p>}
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