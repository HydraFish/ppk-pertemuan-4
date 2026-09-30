import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
};

const COLUMNS = "id, type, amount, category, description, transaction_date";

export type TransactionFilterOptions = {
  type?: "income" | "expense" | "all";
  category?: string;
  month?: number;
  year?: number;
};

// RLS already scopes rows to the caller; `.eq('user_id', ...)` calls are the
// defensive, explicit ownership check the SRS asks for on top of it.
export async function getUserTransactions(userId: string, options: TransactionFilterOptions = {}) {
  const supabase = await createClient();
  const pageSize = 1000;
  const transactions: Transaction[] = [];
  let offset = 0;

  while (true) {
    let query = supabase
      .from("transactions")
      .select(COLUMNS)
      .eq("user_id", userId);

    if (options.type && options.type !== "all") query = query.eq("type", options.type);
    if (options.category) query = query.ilike("category", `%${options.category}%`);
    if (options.month && options.year) {
      const year = String(options.year).padStart(4, "0");
      const month = String(options.month).padStart(2, "0");
      const lastDay = new Date(Date.UTC(options.year, options.month, 0)).getUTCDate();
      query = query
        .gte("transaction_date", `${year}-${month}-01`)
        .lte("transaction_date", `${year}-${month}-${String(lastDay).padStart(2, "0")}`);
    }

    const { data, error } = await query
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error("Gagal memuat transaksi.");
    const rows = (data ?? []) as Transaction[];
    transactions.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return transactions;
}

export async function getUserTransactionById(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Gagal memuat transaksi.");
  return data as Transaction | null;
}
