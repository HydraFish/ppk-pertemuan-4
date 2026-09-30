import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BudgetInput } from "@/lib/validation/budget";

export type Budget = BudgetInput & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type BudgetSummary = {
  budget: Budget | null;
  totalExpense: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "danger" | "unset";
};

const BUDGET_COLUMNS = "id, user_id, month, year, amount, created_at, updated_at";

function periodDates(month: number, year: number) {
  const yearText = String(year).padStart(4, "0");
  const monthText = String(month).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${yearText}-${monthText}-01`,
    end: `${yearText}-${monthText}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function getMonthlyBudget(userId: string, month: number, year: number): Promise<Budget | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select(BUDGET_COLUMNS)
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (error) throw new Error("Gagal memuat anggaran bulanan.");
  return data as Budget | null;
}

export async function upsertMonthlyBudget(userId: string, input: BudgetInput): Promise<Budget> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .upsert({ ...input, user_id: userId }, { onConflict: "user_id,month,year" })
    .select(BUDGET_COLUMNS)
    .single();

  if (error) throw new Error("Gagal menyimpan anggaran bulanan.");
  return data as Budget;
}

export async function getMonthlyExpense(userId: string, month: number, year: number): Promise<number> {
  const supabase = await createClient();
  const { start, end } = periodDates(month, year);
  const pageSize = 1000;
  let offset = 0;
  let totalCents = 0;

  // Supabase limits the number of rows returned in one request. Page through
  // all expenses so an active account's budget remains accurate.
  while (true) {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error("Gagal menghitung pengeluaran bulanan.");
    const rows = data ?? [];
    totalCents += rows.reduce((sum, row) => sum + Math.round(Number(row.amount) * 100), 0);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return totalCents / 100;
}

export async function getBudgetSummary(userId: string, month: number, year: number): Promise<BudgetSummary> {
  const [budget, totalExpense] = await Promise.all([
    getMonthlyBudget(userId, month, year),
    getMonthlyExpense(userId, month, year),
  ]);

  if (!budget) {
    return { budget: null, totalExpense, remaining: 0, percentage: 0, status: "unset" };
  }

  const amount = Number(budget.amount);
  const percentage = (totalExpense / amount) * 100;
  const remaining = Math.round((amount - totalExpense) * 100) / 100;
  const status = percentage < 80 ? "safe" : percentage <= 100 ? "warning" : "danger";

  return { budget, totalExpense, remaining, percentage, status };
}
