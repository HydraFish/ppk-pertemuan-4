"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { validateTransaction } from "@/lib/validation/transaction";

export async function createTransaction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const result = validateTransaction(formData);

  if ("errors" in result) {
    redirect(`/transactions/new?error=validation`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .insert({ ...result.data, user_id: user.id });

  if (error) {
    redirect(`/transactions/new?error=save_failed`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateTransaction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/dashboard?error=not_found");
  }

  const result = validateTransaction(formData);
  if ("errors" in result) {
    redirect(`/transactions/${id}/edit?error=validation`);
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("transactions")
    .update(result.data, { count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error || !count) {
    redirect(`/transactions/${id}/edit?error=save_failed`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/dashboard?error=not_found");
  }

  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
