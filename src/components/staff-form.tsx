'use client';

import { useEffect, useState } from 'react';
import type { StaffRecord } from './staff-dashboard';

type InstitutionOption = {
  id: string;
  name: string;
  neispuoCode: string;
};

type StaffFormProps = {
  staff?: StaffRecord | null;
  institutions: InstitutionOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function StaffForm({
  staff,
  institutions,
  isOpen,
  onClose,
  onSuccess,
}: StaffFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    identifierType: 'EGN',
    identifierValue: '',
    institutionId: institutions[0]?.id ?? '',
    institutionRole: 'STAFF_MEMBER',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        middleName: staff.middleName ?? '',
        lastName: staff.lastName,
        identifierType: staff.identifierType,
        identifierValue: staff.identifierValue,
        institutionId: staff.institution.id,
        institutionRole: staff.institutionRole,
        isActive: staff.isActive,
      });
    } else {
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        identifierType: 'EGN',
        identifierValue: '',
        institutionId: institutions[0]?.id ?? '',
        institutionRole: 'STAFF_MEMBER',
        isActive: true,
      });
    }
    setErrors({});
  }, [staff, isOpen, institutions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff';
      const method = staff ? 'PUT' : 'POST';

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
          setErrors({ submit: data.error || 'Failed to save staff' });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
      setErrors({ submit: 'Грешка при запазване на служителя' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {staff ? 'Редактирай служител' : 'Добави служител'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{errors.submit}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Презиме</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Институция</label>
              <select
                name="institutionId"
                value={formData.institutionId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.institutionId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name} ({institution.neispuoCode})
                  </option>
                ))}
              </select>
              {errors.institutionId && <p className="text-xs text-red-600 mt-1">{errors.institutionId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип идентификатор</label>
              <select
                name="identifierType"
                value={formData.identifierType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.identifierType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="EGN">ЕГН</option>
                <option value="LNCH">ЛНЧ</option>
                <option value="SERVICE_ID">Служебен ID</option>
              </select>
              {errors.identifierType && <p className="text-xs text-red-600 mt-1">{errors.identifierType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стойност на идентификатор</label>
              <input
                type="text"
                name="identifierValue"
                value={formData.identifierValue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.identifierValue ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.identifierValue && <p className="text-xs text-red-600 mt-1">{errors.identifierValue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Функция в институцията</label>
              <select
                name="institutionRole"
                value={formData.institutionRole}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.institutionRole ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="STAFF_MEMBER">Служител</option>
                <option value="INSTITUTION_ADMIN">Админ на институция</option>
              </select>
              {errors.institutionRole && <p className="text-xs text-red-600 mt-1">{errors.institutionRole}</p>}
            </div>

            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700">Активен служител</label>
            </div>
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
