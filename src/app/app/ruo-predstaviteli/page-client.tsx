'use client';

import { useState } from 'react';
import { RuoOfficeDashboard, type RuoOfficeRecord } from '@/components/ruo-office-dashboard';
import { RuoOfficeForm } from '@/components/ruo-office-form';
import {
  RuoRepresentativeDashboard,
  type RuoRepresentativeRecord,
} from '@/components/ruo-representatives-dashboard';
import { RuoRepresentativeForm } from '@/components/ruo-representative-form';

type RuoPredstaviteliPageClientProps = {
  initialOffices: RuoOfficeRecord[];
  initialRepresentatives: RuoRepresentativeRecord[];
};

export default function RuoPredstaviteliPageClient({
  initialOffices,
  initialRepresentatives,
}: RuoPredstaviteliPageClientProps) {
  const [offices, setOffices] = useState(initialOffices);
  const [representatives, setRepresentatives] = useState(initialRepresentatives);
  const [selectedOffice, setSelectedOffice] = useState<RuoOfficeRecord | null>(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState<RuoRepresentativeRecord | null>(null);
  const [isOfficeFormOpen, setIsOfficeFormOpen] = useState(false);
  const [isRepresentativeFormOpen, setIsRepresentativeFormOpen] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [isLoadingRepresentatives, setIsLoadingRepresentatives] = useState(false);

  const refreshOffices = async () => {
    setIsLoadingOffices(true);
    try {
      const response = await fetch('/api/ruo-offices');
      if (response.ok) {
        const data = await response.json();
        setOffices(data);
      }
    } catch (error) {
      console.error('Error refreshing RUO offices:', error);
    } finally {
      setIsLoadingOffices(false);
    }
  };

  const refreshRepresentatives = async () => {
    setIsLoadingRepresentatives(true);
    try {
      const response = await fetch('/api/ruo-representatives');
      if (response.ok) {
        const data = await response.json();
        setRepresentatives(data);
      }
    } catch (error) {
      console.error('Error refreshing RUO representatives:', error);
    } finally {
      setIsLoadingRepresentatives(false);
    }
  };

  const handleOfficeAddClick = () => {
    setSelectedOffice(null);
    setIsOfficeFormOpen(true);
  };

  const handleRepresentativeAddClick = () => {
    setSelectedRepresentative(null);
    setIsRepresentativeFormOpen(true);
  };

  const handleOfficeEdit = (office: RuoOfficeRecord) => {
    setSelectedOffice(office);
    setIsOfficeFormOpen(true);
  };

  const handleRepresentativeEdit = (representative: RuoRepresentativeRecord) => {
    setSelectedRepresentative(representative);
    setIsRepresentativeFormOpen(true);
  };

  const handleOfficeDelete = (id: string) => {
    setOffices((prev) => prev.filter((office) => office.id !== id));
  };

  const handleRepresentativeDelete = (id: string) => {
    setRepresentatives((prev) => prev.filter((representative) => representative.id !== id));
  };

  const handleOfficeFormClose = () => {
    setIsOfficeFormOpen(false);
    setSelectedOffice(null);
  };

  const handleRepresentativeFormClose = () => {
    setIsRepresentativeFormOpen(false);
    setSelectedRepresentative(null);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Общо офиси: <span className="font-semibold text-slate-900">{offices.length}</span>
          </div>
          <button
            onClick={handleOfficeAddClick}
            disabled={isLoadingOffices}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            + Добави РУО офис
          </button>
        </div>

        <RuoOfficeDashboard
          offices={offices}
          onEdit={handleOfficeEdit}
          onDelete={handleOfficeDelete}
          onRefresh={refreshOffices}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Общо представители: <span className="font-semibold text-slate-900">{representatives.length}</span>
          </div>
          <button
            onClick={handleRepresentativeAddClick}
            disabled={isLoadingRepresentatives || offices.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            + Добави РУО представител
          </button>
        </div>

        <RuoRepresentativeDashboard
          representatives={representatives}
          onEdit={handleRepresentativeEdit}
          onDelete={handleRepresentativeDelete}
          onRefresh={refreshRepresentatives}
        />
      </section>

      <RuoOfficeForm
        office={selectedOffice}
        isOpen={isOfficeFormOpen}
        onClose={handleOfficeFormClose}
        onSuccess={refreshOffices}
      />

      <RuoRepresentativeForm
        representative={selectedRepresentative}
        offices={offices}
        isOpen={isRepresentativeFormOpen}
        onClose={handleRepresentativeFormClose}
        onSuccess={refreshRepresentatives}
      />
    </div>
  );
}