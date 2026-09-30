import { createClient } from "@/lib/supabase/server";
import { getBudgetSummary, getMonthlyBudget, upsertMonthlyBudget } from "@/lib/budgets";
import { validateBudget } from "@/lib/validation/budget";

function budgetPeriod(params: URLSearchParams):
  | { month: number; year: number }
  | { error: string } {
  const now = new Date();
  const monthRaw = params.get("month");
  const yearRaw = params.get("year");
  const month = monthRaw === null ? now.getMonth() + 1 : Number(monthRaw);
  const year = yearRaw === null ? now.getFullYear() : Number(yearRaw);
  if (!Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(year) || year < 2020 || year > 9999) {
    return { error: "Bulan atau tahun tidak valid." };
  }
  return { month, year };
}

async function budgetBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return request.json();
  if (contentType.includes("form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    return request.formData();
  }
  throw new Error("unsupported_media_type");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const period = budgetPeriod(new URL(request.url).searchParams);
  if ("error" in period) return Response.json({ error: "validation", details: { period: period.error } }, { status: 400 });

  try {
    const summary = await getBudgetSummary(user.id, period.month, period.year);
    return Response.json({ data: { month: period.month, year: period.year, ...summary } });
  } catch {
    return Response.json({ error: "Gagal memuat anggaran bulanan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await budgetBody(request);
  } catch (error) {
    const status = error instanceof Error && error.message === "unsupported_media_type" ? 415 : 400;
    return Response.json({ error: status === 415 ? "unsupported_media_type" : "invalid_body" }, { status });
  }

  const result = validateBudget(body);
  if ("errors" in result) return Response.json({ error: "validation", details: result.errors }, { status: 400 });

  try {
    const { month, year } = result.data;
    const existing = await getMonthlyBudget(user.id, month, year);
    await upsertMonthlyBudget(user.id, result.data);
    const summary = await getBudgetSummary(user.id, month, year);
    return Response.json({ data: { month, year, ...summary } }, { status: existing ? 200 : 201 });
  } catch {
    return Response.json({ error: "Gagal menyimpan anggaran bulanan." }, { status: 500 });
  }
}
