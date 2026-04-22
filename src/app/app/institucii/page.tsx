import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import InstitutionPageClient from './page-client';

export const metadata = {
  title: 'Управление на Институции',
  description: 'Управление на училища и детски градини',
};

export default async function InstitutionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user has permission
  const allowedRoles = ['ADMIN', 'TECHNICAL_SECRETARY'];
  if (!allowedRoles.includes(session.user.role || '')) {
    redirect('/app');
  }

  // Fetch institutions
  const institutions = await prisma.institution.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Институции</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Управление на институции</h1>
        <p className="mt-2 text-sm text-slate-600">Добавяне, редакция и изтриване на училища и детски градини.</p>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <InstitutionPageClient institutions={institutions} />
      </section>
    </main>
  );
}
