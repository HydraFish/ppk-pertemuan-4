import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/supabase/dal";
import { getUserTransactions } from "@/lib/transactions";
import { formatRupiah } from "@/lib/format";
import { AppNav } from "@/components/AppNav";
import { DeleteTransactionButton } from "@/components/DeleteTransactionButton";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  const theme = (await cookies()).get("duitku_theme")?.value === "dark" ? "dark" : "light";
  const transactions = await getUserTransactions(user.id);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppNav email={user.email ?? ""} theme={theme} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Pemasukan</p>
            <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">
              + {formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Pengeluaran</p>
            <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
              - {formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Saldo</p>
            <p className="mt-1 text-xl font-semibold">{formatRupiah(balance)}</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
            <Link href="/transactions/new" className="text-sm font-medium underline">
              + Tambah Transaksi
            </Link>
          </div>

          {transactions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Belum ada transaksi. Mulai catat pemasukan atau pengeluaranmu.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <span aria-hidden="true">{t.type === "income" ? "▲" : "▼"}</span>{" "}
                      {t.category}
                      <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </p>
                    {t.description && (
                      <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{t.description}</p>
                    )}
                    <p className="text-xs text-zinc-400">{t.transaction_date}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p
                      className={
                        t.type === "income"
                          ? "font-semibold text-green-600 dark:text-green-400"
                          : "font-semibold text-red-600 dark:text-red-400"
                      }
                    >
                      {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                    </p>
                    <Link href={`/transactions/${t.id}/edit`} className="text-sm font-medium underline">
                      Ubah
                    </Link>
                    <DeleteTransactionButton id={t.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
