import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import StaffPageClient from './page-client';

export const metadata = {
  title: 'Управление на служители',
  description: 'Staff регистър на институциите',
};

export default async function StaffPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [staff, institutions] = await Promise.all([
    prisma.staff.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            neispuoCode: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        neispuoCode: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Staff</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Управление на служители</h1>
        <p className="mt-2 text-sm text-slate-600">Кадрови регистър по институции (без login привързване).</p>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <StaffPageClient initialStaff={staff} institutions={institutions} />
      </section>
    </main>
  );
}
