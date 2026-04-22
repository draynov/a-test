import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import RuoPredstaviteliPageClient from './page-client';

export const metadata = {
  title: 'РУО представители',
  description: 'Управление на РУО офиси и представители',
};

export default async function RuoPredstaviteliPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [offices, representatives] = await Promise.all([
    prisma.ruoOffice.findMany({
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    }),
    prisma.ruoRepresentative.findMany({
      include: {
        ruoOffice: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">РУО</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">РУО представители</h1>
        <p className="mt-2 text-sm text-slate-600">
          Отделен регистър за РУО офиси и техните представители, независим от училищните институции.
        </p>
      </header>

      <section className="overflow-hidden rounded-4xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <RuoPredstaviteliPageClient initialOffices={offices} initialRepresentatives={representatives} />
      </section>
    </main>
  );
}