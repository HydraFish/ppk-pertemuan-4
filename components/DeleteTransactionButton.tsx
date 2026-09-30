"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  onDeleted?: (id: string) => void;
  onError?: (message: string) => void;
};

export function DeleteTransactionButton({ id, onDeleted, onError }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Hapus transaksi ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      // 404 means it is already gone (e.g. deleted from another tab): same end state.
      if (!res.ok && res.status !== 404) throw new Error("delete_failed");

      if (onDeleted) {
        onDeleted(id);
      } else {
        router.refresh();
      }
    } catch {
      const message = "Gagal menghapus transaksi. Coba lagi.";
      if (onError) {
        onError(message);
      } else {
        window.alert(message);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
