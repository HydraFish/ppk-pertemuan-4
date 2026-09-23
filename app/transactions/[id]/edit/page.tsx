import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/dal";
import { getUserTransactionById } from "@/lib/transactions";
import { updateTransaction } from "@/lib/actions/transactions";
import { AppNav } from "@/components/AppNav";
import { TransactionForm } from "@/components/TransactionForm";

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAuthenticatedUser();
  const theme = (await cookies()).get("duitku_theme")?.value === "dark" ? "dark" : "light";
  const { id } = await params;
  const { error } = await searchParams;

  const transaction = await getUserTransactionById(user.id, id);
  if (!transaction) {
    redirect("/dashboard?error=not_found");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppNav email={user.email ?? ""} theme={theme} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-xl font-semibold">Ubah Transaksi</h1>
        <TransactionForm
          action={updateTransaction}
          submitLabel="Simpan Perubahan"
          hasError={!!error}
          defaultValues={transaction}
        />
      </main>
    </div>
  );
}
