import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/supabase/dal";
import { createTransaction } from "@/lib/actions/transactions";
import { AppNav } from "@/components/AppNav";
import { TransactionForm } from "@/components/TransactionForm";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAuthenticatedUser();
  const theme = (await cookies()).get("duitku_theme")?.value === "dark" ? "dark" : "light";
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppNav email={user.email ?? ""} theme={theme} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-xl font-semibold">Tambah Transaksi</h1>
        <TransactionForm action={createTransaction} submitLabel="Simpan" hasError={!!error} />
      </main>
    </div>
  );
}
