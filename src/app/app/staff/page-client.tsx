'use client';

import { useState } from 'react';
import { StaffDashboard, type StaffRecord } from '@/components/staff-dashboard';
import { StaffForm } from '@/components/staff-form';

type InstitutionOption = {
  id: string;
  name: string;
  neispuoCode: string;
};

type StaffPageClientProps = {
  initialStaff: StaffRecord[];
  institutions: InstitutionOption[];
};

export default function StaffPageClient({ initialStaff, institutions }: StaffPageClientProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: StaffRecord) => {
    setSelectedStaff(member);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStaff(null);
  };

  const refreshStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error refreshing staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((member) => member.id !== id));
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Общо: <span className="font-semibold text-gray-900">{staff.length}</span> служители
        </div>
        <button
          onClick={handleAddClick}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          + Добави служител
        </button>
      </div>

      <StaffDashboard
        staff={staff}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={refreshStaff}
      />

      <StaffForm
        staff={selectedStaff}
        institutions={institutions}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={refreshStaff}
      />
    </>
  );
}
