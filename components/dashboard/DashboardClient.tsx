"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/lib/transactions";
import { SummaryCards } from "./SummaryCards";
import {
  DEFAULT_FILTER,
  TransactionFilter,
  type TransactionFilterState,
} from "./TransactionFilter";
import { TransactionList } from "./TransactionList";
import { TransactionModal, readApiError } from "./TransactionModal";

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

type Notification = { type: "success" | "error"; message: string };

type TransactionsResponse = {
  transactions: Transaction[];
  summary: Summary;
};

const NOTIFICATION_MS = 4000;

// Initial data from the server is unfiltered, so it must be summarized the
// same way the default (empty) filter would be: over every transaction.
function summarize(transactions: Transaction[]): Summary {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

function buildQuery(filter: TransactionFilterState) {
  const params = new URLSearchParams({ type: filter.type });
  if (filter.category) params.set("category", filter.category);
  if (filter.month > 0) params.set("month", String(filter.month));
  if (filter.year > 0) params.set("year", String(filter.year));
  return params.toString();
}

export function DashboardClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [summary, setSummary] = useState(() => summarize(initialTransactions));
  const [filter, setFilter] = useState<TransactionFilterState>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [budgetRefreshTrigger, setBudgetRefreshTrigger] = useState(0);

  // Only the newest request may write state; older responses are dropped.
  const latestRequest = useRef(0);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, []);

  function notify(type: Notification["type"], message: string) {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    setNotification({ type, message });
    notificationTimer.current = setTimeout(() => setNotification(null), NOTIFICATION_MS);
  }

  async function fetchTransactions(customFilter: TransactionFilterState) {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions?${buildQuery(customFilter)}`);
      if (requestId !== latestRequest.current) return;

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const message = await readApiError(res, "Gagal memuat transaksi. Coba lagi.");
        if (requestId === latestRequest.current) notify("error", message);
        return;
      }

      const data: TransactionsResponse = await res.json();
      if (requestId !== latestRequest.current) return;

      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch {
      if (requestId === latestRequest.current) {
        notify("error", "Gagal memuat transaksi. Periksa koneksi lalu coba lagi.");
      }
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }

  // Budget widget (Programmer 3) re-syncs from either signal below.
  function onTransactionMutated() {
    setBudgetRefreshTrigger((n) => n + 1);
    window.dispatchEvent(new CustomEvent("duitku:transaction-mutated"));
  }

  function handleFilterChange(next: TransactionFilterState) {
    setFilter(next);
    fetchTransactions(next);
  }

  function handleReset() {
    setFilter(DEFAULT_FILTER);
    fetchTransactions(DEFAULT_FILTER);
  }

  function handleTransactionSuccess(message = "Transaksi berhasil disimpan.") {
    notify("success", message);
    onTransactionMutated();
    fetchTransactions(filter);
  }

  function handleDelete(id: string) {
    // Row disappears right away; the refetch then corrects the summary.
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    notify("success", "Transaksi berhasil dihapus.");
    onTransactionMutated();
    fetchTransactions(filter);
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  const hasActiveFilter =
    filter.type !== "all" || filter.category !== "" || filter.month > 0 || filter.year > 0;

  return (
    <>
      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        balance={summary.balance}
        isLoading={isLoading}
      />

      {/*
        Slot Programmer 3: render <MonthlyBudgetCard key={budgetRefreshTrigger} />
        inside this div. It stays hidden while empty.
      */}
      <div id="monthly-budget-slot" data-refresh-key={budgetRefreshTrigger} className="empty:hidden" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            + Tambah Transaksi
          </button>
        </div>

        <TransactionFilter filter={filter} onChange={handleFilterChange} onReset={handleReset} />

        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          hasActiveFilter={hasActiveFilter}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onDeleteError={(message) => notify("error", message)}
        />
      </section>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingTransaction={editingTransaction}
        onSuccess={handleTransactionSuccess}
      />

      {notification && (
        <div
          role={notification.type === "error" ? "alert" : "status"}
          className={
            "fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg " +
            (notification.type === "error" ? "bg-red-600" : "bg-green-600")
          }
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
