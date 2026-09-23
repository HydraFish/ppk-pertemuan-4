"use client";

import { deleteTransaction } from "@/lib/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  return (
    <form
      action={deleteTransaction}
      onSubmit={(event) => {
        if (!confirm("Hapus transaksi ini? Tindakan ini tidak dapat dibatalkan.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-medium text-red-600 hover:underline dark:text-red-400">
        Hapus
      </button>
    </form>
  );
}
