import type { TransactionType } from "@/lib/validation/transaction";

type Props = {
  action: (formData: FormData) => void;
  submitLabel: string;
  hasError: boolean;
  defaultValues?: {
    id?: string;
    type?: TransactionType;
    amount?: number;
    category?: string;
    description?: string | null;
    transaction_date?: string;
  };
};

// Server-side validation is authoritative (see lib/validation/transaction.ts);
// this form only re-displays a generic error since redirects can't carry
// field-level messages without a session store.
export function TransactionForm({ action, submitLabel, hasError, defaultValues = {} }: Props) {
  return (
    <form action={action} className="space-y-4">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      {hasError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Periksa kembali data yang kamu masukkan.
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
              defaultChecked={(defaultValues.type ?? "income") === "income"}
              required
            />
            Pemasukan
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="expense"
              defaultChecked={defaultValues.type === "expense"}
            />
            Pengeluaran
          </label>
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium">
          Nominal (Rp)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          defaultValue={defaultValues.amount}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium">
          Kategori
        </label>
        <input
          id="category"
          name="category"
          type="text"
          maxLength={50}
          required
          defaultValue={defaultValues.category}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={255}
          defaultValue={defaultValues.description ?? ""}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="transaction_date" className="text-sm font-medium">
          Tanggal
        </label>
        <input
          id="transaction_date"
          name="transaction_date"
          type="date"
          required
          defaultValue={defaultValues.transaction_date}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
