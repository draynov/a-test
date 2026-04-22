'use client';

import { useState } from 'react';
import { InstitutionDashboard } from '@/components/institution-dashboard';
import { InstitutionForm } from '@/components/institution-form';

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

interface InstitutionPageClientProps {
  institutions: Institution[];
}

export default function InstitutionPageClient({
  institutions: initialInstitutions,
}: InstitutionPageClientProps) {
  const [institutions, setInstitutions] = useState(initialInstitutions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setSelectedInstitution(null);
    setIsFormOpen(true);
  };

  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedInstitution(null);
  };

  const handleFormSuccess = async () => {
    // Refresh institutions list
    setIsLoading(true);
    try {
      const response = await fetch('/api/institutions');
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (error) {
      console.error('Error refreshing institutions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setInstitutions((prev) => prev.filter((inst) => inst.id !== id));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/institutions');
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (error) {
      console.error('Error refreshing institutions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Общо: <span className="font-semibold text-gray-900">{institutions.length}</span> институции
        </div>
        <button
          onClick={handleAddClick}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          + Добави Институция
        </button>
      </div>

      <InstitutionDashboard
        institutions={institutions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
      />

      <InstitutionForm
        institution={selectedInstitution}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
