'use client';

import { useState, useEffect } from 'react';

interface Institution {
  id: string;
  neispuoCode: string;
  name: string;
  municipality: string;
}

interface InstitutionFormProps {
  institution?: Institution | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstitutionForm({
  institution,
  isOpen,
  onClose,
  onSuccess,
}: InstitutionFormProps) {
  const [formData, setFormData] = useState({
    neispuoCode: '',
    name: '',
    municipality: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (institution) {
      setFormData({
        neispuoCode: institution.neispuoCode,
        name: institution.name,
        municipality: institution.municipality,
      });
    } else {
      setFormData({
        neispuoCode: '',
        name: '',
        municipality: '',
      });
    }
    setErrors({});
  }, [institution, isOpen]);

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
      const url = institution
        ? `/api/institutions/${institution.id}`
        : '/api/institutions';
      const method = institution ? 'PUT' : 'POST';

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
          setErrors({ submit: data.error || 'Failed to save' });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving institution:', error);
      setErrors({ submit: 'Грешка при запазване' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {institution ? 'Редактирай Институция' : 'Добави Институция'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код по НЕИСПУО
            </label>
            <input
              type="text"
              name="neispuoCode"
              value={formData.neispuoCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.neispuoCode
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.neispuoCode && (
              <p className="text-xs text-red-600 mt-1">{errors.neispuoCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Наименование
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Община
            </label>
            <input
              type="text"
              name="municipality"
              value={formData.municipality}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.municipality
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.municipality && (
              <p className="text-xs text-red-600 mt-1">{errors.municipality}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Запазване...' : 'Запази'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
