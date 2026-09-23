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

// RLS already scopes rows to the caller; `.eq('user_id', ...)` calls are the
// defensive, explicit ownership check the SRS asks for on top of it.
export async function getUserTransactions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat transaksi.");
  }

  return (data ?? []) as Transaction[];
}

export async function getUserTransactionById(userId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  return data as Transaction | null;
}
