"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Transaction } from "@/lib/transactions";
import { CATEGORY_SUGGESTIONS } from "./TransactionFilter";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: Transaction | null;
  onSuccess: (message: string) => void;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function todayLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const ERROR_CODE_MESSAGES: Record<string, string> = {
  unauthorized: "Sesi kamu berakhir. Silakan masuk lagi.",
  not_found: "Transaksi tidak ditemukan. Muat ulang halaman lalu coba lagi.",
  invalid_body: "Data yang dikirim tidak valid.",
  unsupported_media_type: "Format data yang dikirim tidak didukung.",
  validation: "Periksa kembali data yang kamu masukkan.",
};

// The API answers with `{ error: "<code>" | "<pesan>", details?: { field: pesan } }`.
// Codes are mapped to Indonesian text; validation details are shown as-is.
export async function readApiError(res: Response, fallback: string) {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const { error, details } = body as { error?: unknown; details?: unknown };

      if (error === "validation" && details && typeof details === "object") {
        const messages = Object.values(details).filter(
          (value): value is string => typeof value === "string",
        );
        if (messages.length > 0) return messages.join(" ");
      }

      if (typeof error === "string") {
        if (ERROR_CODE_MESSAGES[error]) return ERROR_CODE_MESSAGES[error];
        if (!/^[a-z_]+$/.test(error)) return error;
      }
    }
  } catch {
    // body was not JSON; use the fallback below
  }
  return fallback;
}

export function TransactionModal({ isOpen, onClose, editingTransaction, onSuccess }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={editingTransaction ? "Ubah Transaksi" : "Tambah Transaksi"}
      onClose={onClose}
      onCancel={(event) => {
        if (isSubmitting) event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-zinc-200 bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50 dark:border-zinc-800"
    >
      {isOpen && (
        <ModalForm
          key={editingTransaction?.id ?? "new"}
          editingTransaction={editingTransaction}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </dialog>
  );
}

type ModalFormProps = {
  editingTransaction: Transaction | null;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function ModalForm({
  editingTransaction,
  isSubmitting,
  setIsSubmitting,
  onClose,
  onSuccess,
}: ModalFormProps) {
  const uid = useId();
  const [error, setError] = useState<string | null>(null);
  const [defaultDate] = useState(todayLocal);
  const isEdit = editingTransaction !== null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      type: formData.get("type"),
      amount: Number(formData.get("amount")),
      category: String(formData.get("category") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      transaction_date: formData.get("transaction_date"),
    };

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/transactions/${editingTransaction.id}` : "/api/transactions",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        setError(await readApiError(res, "Gagal menyimpan transaksi. Coba lagi."));
        return;
      }

      onSuccess(isEdit ? "Transaksi berhasil diperbarui." : "Transaksi berhasil ditambahkan.");
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{isEdit ? "Ubah Transaksi" : "Tambah Transaksi"}</h2>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Jenis Transaksi</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="income"
              defaultChecked={(editingTransaction?.type ?? "income") === "income"}
              required
            />
            Pemasukan
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="expense"
              defaultChecked={editingTransaction?.type === "expense"}
            />
            Pengeluaran
          </label>
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor={`${uid}-amount`} className="text-sm font-medium">
          Nominal (Rp)
        </label>
        <input
          id={`${uid}-amount`}
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          defaultValue={editingTransaction?.amount}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${uid}-category`} className="text-sm font-medium">
          Kategori
        </label>
        <input
          id={`${uid}-category`}
          name="category"
          type="text"
          list={`${uid}-categories`}
          maxLength={50}
          required
          defaultValue={editingTransaction?.category}
          className={fieldClass}
        />
        <datalist id={`${uid}-categories`}>
          {CATEGORY_SUGGESTIONS.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${uid}-description`} className="text-sm font-medium">
          Deskripsi (opsional)
        </label>
        <textarea
          id={`${uid}-description`}
          name="description"
          maxLength={255}
          defaultValue={editingTransaction?.description ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${uid}-date`} className="text-sm font-medium">
          Tanggal
        </label>
        <input
          id={`${uid}-date`}
          name="transaction_date"
          type="date"
          required
          defaultValue={editingTransaction?.transaction_date ?? defaultDate}
          className={fieldClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
