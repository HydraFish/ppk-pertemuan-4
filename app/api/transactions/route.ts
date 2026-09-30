import { createClient } from "@/lib/supabase/server";
import { getUserTransactions, type TransactionFilterOptions } from "@/lib/transactions";
import { validateTransaction } from "@/lib/validation/transaction";

const COLUMNS = "id, type, amount, category, description, transaction_date";

function parseFilters(params: URLSearchParams):
  | { options: TransactionFilterOptions }
  | { error: string } {
  const type = params.get("type");
  const category = params.get("category")?.trim();
  const monthRaw = params.get("month");
  const yearRaw = params.get("year");

  if (type && type !== "all" && type !== "income" && type !== "expense") {
    return { error: "Jenis transaksi tidak valid." };
  }
  if (category && category.length > 50) {
    return { error: "Kategori maksimal 50 karakter." };
  }
  if ((monthRaw === null) !== (yearRaw === null)) {
    return { error: "Bulan dan tahun harus diberikan bersama." };
  }

  let month: number | undefined;
  let year: number | undefined;
  if (monthRaw !== null && yearRaw !== null) {
    month = Number(monthRaw);
    year = Number(yearRaw);
    if (!Number.isInteger(month) || month < 1 || month > 12 ||
        !Number.isInteger(year) || year < 2020 || year > 9999) {
      return { error: "Bulan atau tahun tidak valid." };
    }
  }

  return { options: { type: (type || "all") as TransactionFilterOptions["type"], category, month, year } };
}

async function transactionBody(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("invalid_body");
    }
    const formData = new FormData();
    for (const key of ["type", "amount", "category", "description", "transaction_date"]) {
      const value = (body as Record<string, unknown>)[key];
      if (value !== undefined && value !== null) formData.set(key, String(value));
    }
    return formData;
  }
  if (contentType.includes("form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    return request.formData();
  }
  throw new Error("unsupported_media_type");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = parseFilters(new URL(request.url).searchParams);
  if ("error" in parsed) return Response.json({ error: "validation", details: { filters: parsed.error } }, { status: 400 });

  try {
    // Type and category filter the list; the financial cards summarize the
    // whole selected period (or all time when no period was requested).
    const { type, category, month, year } = parsed.options;
    const [transactions, periodTransactions] = await Promise.all([
      getUserTransactions(user.id, { type, category, month, year }),
      getUserTransactions(user.id, { month, year }),
    ]);
    const totalIncome = transactionsTotal(periodTransactions, "income");
    const totalExpense = transactionsTotal(periodTransactions, "expense");
    return Response.json({ transactions, summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense } });
  } catch {
    return Response.json({ error: "Gagal memuat transaksi." }, { status: 500 });
  }
}

function transactionsTotal(
  transactions: Awaited<ReturnType<typeof getUserTransactions>>,
  type: "income" | "expense",
) {
  const cents = transactions.reduce(
    (sum, transaction) => sum + (transaction.type === type ? Math.round(Number(transaction.amount) * 100) : 0),
    0,
  );
  return cents / 100;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await transactionBody(request);
  } catch (error) {
    const status = error instanceof Error && error.message === "unsupported_media_type" ? 415 : 400;
    return Response.json({ error: status === 415 ? "unsupported_media_type" : "invalid_body" }, { status });
  }

  const result = validateTransaction(formData);
  if ("errors" in result) return Response.json({ error: "validation", details: result.errors }, { status: 400 });

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...result.data, user_id: user.id })
    .select(COLUMNS)
    .single();

  if (error) return Response.json({ error: "Gagal menyimpan transaksi." }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
