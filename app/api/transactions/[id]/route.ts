import { createClient } from "@/lib/supabase/server";
import { getUserTransactionById } from "@/lib/transactions";
import { validateTransaction } from "@/lib/validation/transaction";

const COLUMNS = "id, type, amount, category, description, transaction_date";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };

async function transactionBody(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_body");
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

export async function GET(_request: Request, context: Context) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "not_found" }, { status: 404 });
  try {
    const transaction = await getUserTransactionById(user.id, id);
    if (!transaction) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json({ data: transaction });
  } catch {
    return Response.json({ error: "Gagal memuat transaksi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "not_found" }, { status: 404 });

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
    .update(result.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(COLUMNS)
    .maybeSingle();

  if (error) return Response.json({ error: "Gagal memperbarui transaksi." }, { status: 500 });
  if (!data) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ data });
}

export async function DELETE(_request: Request, context: Context) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "not_found" }, { status: 404 });

  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return Response.json({ error: "Gagal menghapus transaksi." }, { status: 500 });
  if (!data) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ success: true });
}
