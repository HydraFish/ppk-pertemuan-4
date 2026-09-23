export type TransactionType = "income" | "expense";

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
};

export type TransactionFieldErrors = Partial<
  Record<keyof TransactionInput, string>
>;

export function validateTransaction(
  formData: FormData,
): { data: TransactionInput } | { errors: TransactionFieldErrors } {
  const errors: TransactionFieldErrors = {};

  const type = formData.get("type");
  if (type !== "income" && type !== "expense") {
    errors.type = "Jenis transaksi harus pemasukan atau pengeluaran.";
  }

  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(amountRaw);
  if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Nominal wajib diisi dan harus lebih besar dari 0.";
  }

  const category = String(formData.get("category") ?? "").trim();
  if (!category) {
    errors.category = "Kategori wajib diisi.";
  } else if (category.length > 50) {
    errors.category = "Kategori maksimal 50 karakter.";
  }

  const descriptionRaw = String(formData.get("description") ?? "").trim();
  if (descriptionRaw.length > 255) {
    errors.description = "Deskripsi maksimal 255 karakter.";
  }

  const transaction_date = String(formData.get("transaction_date") ?? "");
  if (!transaction_date || Number.isNaN(Date.parse(transaction_date))) {
    errors.transaction_date = "Tanggal transaksi wajib diisi dan valid.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      type: type as TransactionType,
      amount,
      category,
      description: descriptionRaw || null,
      transaction_date,
    },
  };
}
