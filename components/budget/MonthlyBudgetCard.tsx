"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import {
  BudgetSummaryData,
  BudgetStatus,
  getBudgetStatusConfig,
  getIndonesianMonthName,
  INDONESIAN_MONTHS,
  BUDGET_REFRESH_EVENT,
  TRANSACTION_UPDATED_EVENT,
  TRANSACTION_MUTATED_EVENT,
  dispatchBudgetRefresh,
} from "@/lib/budgetUtils";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { SetBudgetModal } from "./SetBudgetModal";

export interface MonthlyBudgetCardProps {
  initialMonth?: number;
  initialYear?: number;
  refreshTrigger?: unknown;
  onBudgetChanged?: () => void;
  className?: string;
}

/**
 * Exported helper function for Programmer 2 or other components to trigger
 * a reactive refresh of budget data without reloading the browser.
 */
export function refetchBudget() {
  dispatchBudgetRefresh();
}

export function MonthlyBudgetCard({
  initialMonth,
  initialYear,
  refreshTrigger,
  onBudgetChanged,
  className = "",
}: MonthlyBudgetCardProps) {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(
    initialMonth ?? currentDate.getMonth() + 1
  );
  const [year, setYear] = useState<number>(
    initialYear ?? currentDate.getFullYear()
  );

  const [budgetData, setBudgetData] = useState<BudgetSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Re-fetch function for manual triggers & event callbacks
  const reloadBudget = useCallback(
    async (targetMonth: number, targetYear: number) => {
      try {
        const res = await fetch(
          `/api/budgets?month=${targetMonth}&year=${targetYear}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            setBudgetData({
              month: targetMonth,
              year: targetYear,
              budget: null,
              totalExpense: 0,
              remaining: 0,
              percentage: 0,
              status: "unset",
            });
            setIsLoading(false);
            return;
          }

          const errJson = await res.json().catch(() => null);
          throw new Error(
            errJson?.error ||
              errJson?.message ||
              `Gagal memuat anggaran (${res.status})`
          );
        }

        const json = await res.json();
        if (json && json.data) {
          setBudgetData(json.data);
        } else {
          setBudgetData({
            month: targetMonth,
            year: targetYear,
            budget: null,
            totalExpense: 0,
            remaining: 0,
            percentage: 0,
            status: "unset",
          });
        }
        setErrorMessage(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data anggaran.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Primary data fetching effect (async without synchronous setState)
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
        if (ignore) return;

        if (!res.ok) {
          if (res.status === 404) {
            setBudgetData({
              month,
              year,
              budget: null,
              totalExpense: 0,
              remaining: 0,
              percentage: 0,
              status: "unset",
            });
            setErrorMessage(null);
            setIsLoading(false);
            return;
          }

          const errJson = await res.json().catch(() => null);
          throw new Error(
            errJson?.error ||
              errJson?.message ||
              `Gagal memuat anggaran (${res.status})`
          );
        }

        const json = await res.json();
        if (ignore) return;

        if (json && json.data) {
          setBudgetData(json.data);
        } else {
          setBudgetData({
            month,
            year,
            budget: null,
            totalExpense: 0,
            remaining: 0,
            percentage: 0,
            status: "unset",
          });
        }
        setErrorMessage(null);
      } catch (err) {
        if (ignore) return;
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data anggaran.";
        setErrorMessage(message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [month, year, refreshTrigger]);

  // Reactive listener for refresh events from P2/other actions
  useEffect(() => {
    const handleRefresh = () => {
      reloadBudget(month, year);
    };

    window.addEventListener(BUDGET_REFRESH_EVENT, handleRefresh);
    window.addEventListener(TRANSACTION_UPDATED_EVENT, handleRefresh);
    window.addEventListener(TRANSACTION_MUTATED_EVENT, handleRefresh);

    return () => {
      window.removeEventListener(BUDGET_REFRESH_EVENT, handleRefresh);
      window.removeEventListener(TRANSACTION_UPDATED_EVENT, handleRefresh);
      window.removeEventListener(TRANSACTION_MUTATED_EVENT, handleRefresh);
    };
  }, [month, year, reloadBudget]);

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    setIsLoading(true);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setIsLoading(true);
  };

  const handleModalSuccess = () => {
    setIsLoading(true);
    reloadBudget(month, year);
    onBudgetChanged?.();
  };

  // Generate year options (current year +/- 2 years)
  const currentSystemYear = new Date().getFullYear();
  const yearOptions = [
    currentSystemYear - 1,
    currentSystemYear,
    currentSystemYear + 1,
  ];

  const monthName = getIndonesianMonthName(month);
  const hasBudget = Boolean(budgetData?.budget && budgetData.status !== "unset");
  const status: BudgetStatus = budgetData?.status ?? "unset";
  const statusConfig = getBudgetStatusConfig(status);

  return (
    <section aria-labelledby="budget-section-heading" className={className}>
      {/* Month & Year Filter Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="budget-section-heading"
          className="text-lg font-semibold text-foreground"
        >
          Anggaran Bulanan
        </h2>

        <div className="flex items-center gap-2">
          <label htmlFor="budget-month-select" className="sr-only">
            Pilih Bulan
          </label>
          <select
            id="budget-month-select"
            value={month}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-background px-2.5 py-1.5 text-xs sm:text-sm font-medium text-foreground dark:border-zinc-700 dark:bg-zinc-900"
          >
            {INDONESIAN_MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <label htmlFor="budget-year-select" className="sr-only">
            Pilih Tahun
          </label>
          <select
            id="budget-year-select"
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-background px-2.5 py-1.5 text-xs sm:text-sm font-medium text-foreground dark:border-zinc-700 dark:bg-zinc-900"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-background p-5 shadow-xs dark:border-zinc-800 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <div className="flex items-center justify-between">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                reloadBudget(month, year);
              }}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* 2. Empty State (Belum ada anggaran) */}
      {!isLoading && !errorMessage && !hasBudget && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700 bg-background">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Belum ada anggaran pengeluaran untuk bulan {monthName} {year}.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            + Tetapkan Anggaran
          </button>
        </div>
      )}

      {/* 3. Active Budget State */}
      {!isLoading && !errorMessage && hasBudget && budgetData?.budget && (
        <div className="rounded-xl border border-zinc-200 bg-background p-5 shadow-xs dark:border-zinc-800 space-y-5">
          {/* Header Widget */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-foreground">
                Periode: {monthName} {year}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.badgeBg}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200 underline"
            >
              Ubah Anggaran
            </button>
          </div>

          {/* Grid 3 Kolom Metrik Utama */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Target Anggaran
              </p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-foreground">
                {formatRupiah(budgetData.budget.amount)}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pengeluaran Aktual
              </p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-red-600 dark:text-red-400">
                {formatRupiah(budgetData.totalExpense)}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sisa Anggaran
              </p>
              <p
                className={`mt-1 text-base sm:text-lg font-semibold ${
                  budgetData.remaining < 0 || budgetData.status === "danger"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {budgetData.remaining < 0 || budgetData.status === "danger"
                  ? `+ ${formatRupiah(Math.abs(budgetData.remaining))} (Defisit)`
                  : formatRupiah(budgetData.remaining)}
              </p>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <BudgetProgressBar
            percentage={budgetData.percentage}
            status={budgetData.status}
          />

          {/* Conditional Alert: Over-budget Danger Warning */}
          {budgetData.status === "danger" && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
            >
              <span className="text-base leading-none" aria-hidden="true">
                ⚠️
              </span>
              <p className="font-medium">
                Perhatian: Pengeluaranmu telah melebihi anggaran sebesar{" "}
                {formatRupiah(Math.abs(budgetData.remaining))}! Pertimbangkan
                untuk mengurangi pengeluaran.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMonth={month}
        currentYear={year}
        currentAmount={budgetData?.budget?.amount ?? null}
        onSuccess={handleModalSuccess}
      />
    </section>
  );
}
