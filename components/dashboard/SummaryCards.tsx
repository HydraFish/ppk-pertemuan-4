import { formatRupiah } from "@/lib/format";

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  isLoading?: boolean;
};

export function SummaryCards({ totalIncome, totalExpense, balance, isLoading = false }: Props) {
  return (
    <section
      aria-busy={isLoading}
      className={
        "grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-3 " + (isLoading ? "opacity-60" : "")
      }
    >
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
  );
}
