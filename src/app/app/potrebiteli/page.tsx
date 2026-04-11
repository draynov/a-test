import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Потребители</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Регистрирани потребители</h1>
        <p className="mt-2 text-sm text-slate-600">Данните се зареждат от таблицата User.</p>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Име</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Роля</th>
                <th className="px-6 py-4 font-semibold">Създаден</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                    Няма потребители.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 text-sm text-slate-700 last:border-b-0">
                    <td className="px-6 py-4">{user.name ?? "-"}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleString("bg-BG")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
