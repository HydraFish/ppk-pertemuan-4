"use client";

import type { Transaction } from "@/lib/transactions";
import { formatRupiah } from "@/lib/format";
import { DeleteTransactionButton } from "@/components/DeleteTransactionButton";

type Props = {
  transactions: Transaction[];
  isLoading: boolean;
  hasActiveFilter: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDeleteError: (message: string) => void;
};

export function TransactionList({
  transactions,
  isLoading,
  hasActiveFilter,
  onEdit,
  onDelete,
  onDeleteError,
}: Props) {
  if (isLoading && transactions.length === 0) {
    return (
      <ul aria-busy="true" aria-label="Memuat transaksi" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-black/[.06] dark:bg-white/[.08]" />
        ))}
      </ul>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {hasActiveFilter
          ? "Tidak ada transaksi yang cocok dengan filter ini."
          : "Belum ada transaksi. Mulai catat pemasukan atau pengeluaranmu."}
      </p>
    );
  }

  return (
    <ul
      aria-busy={isLoading}
      className={
        "divide-y divide-zinc-200 rounded-lg border border-zinc-200 transition-opacity dark:divide-zinc-800 dark:border-zinc-800 " +
        (isLoading ? "opacity-60" : "")
      }
    >
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">
              <span aria-hidden="true">{t.type === "income" ? "▲" : "▼"}</span> {t.category}
              <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
              </span>
            </p>
            {t.description && (
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{t.description}</p>
            )}
            <p className="text-xs text-zinc-400">{t.transaction_date}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p
              className={
                t.type === "income"
                  ? "font-semibold text-green-600 dark:text-green-400"
                  : "font-semibold text-red-600 dark:text-red-400"
              }
            >
              {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onEdit(t)}
                className="text-sm font-medium underline"
              >
                Ubah
              </button>
              <DeleteTransactionButton id={t.id} onDeleted={onDelete} onError={onDeleteError} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
