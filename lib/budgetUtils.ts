export type BudgetStatus = "safe" | "warning" | "danger" | "unset";

export interface BudgetRecord {
  id: string;
  amount: number;
}

export interface BudgetSummaryData {
  month: number;
  year: number;
  budget: BudgetRecord | null;
  totalExpense: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetApiResponse {
  data?: BudgetSummaryData;
  error?: string;
  message?: string;
}

export function getBudgetStatusConfig(status: BudgetStatus) {
  switch (status) {
    case "safe":
      return {
        label: "Aman",
        barColor: "bg-green-600 dark:bg-green-500",
        badgeBg: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
        textColor: "text-green-600 dark:text-green-400",
      };
    case "warning":
      return {
        label: "Waspada",
        barColor: "bg-amber-500 dark:bg-amber-400",
        badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        textColor: "text-amber-600 dark:text-amber-400",
      };
    case "danger":
      return {
        label: "Melebihi Anggaran",
        barColor: "bg-red-600 dark:bg-red-500",
        badgeBg: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        textColor: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        label: "Belum Ditetapkan",
        barColor: "bg-zinc-300 dark:bg-zinc-700",
        badgeBg: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
        textColor: "text-zinc-500 dark:text-zinc-400",
      };
  }
}

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function getIndonesianMonthName(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) {
    return `Bulan ${monthNumber}`;
  }
  return INDONESIAN_MONTHS[monthNumber - 1];
}

export const BUDGET_REFRESH_EVENT = "duitku:budget-refresh";
export const TRANSACTION_UPDATED_EVENT = "duitku:transaction-updated";
export const TRANSACTION_MUTATED_EVENT = "duitku:transaction-mutated";

export function dispatchBudgetRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUDGET_REFRESH_EVENT));
  }
}
