export type BudgetInput = {
  month: number;
  year: number;
  amount: number;
};

function field(input: unknown, name: keyof BudgetInput): unknown {
  if (input instanceof FormData) return input.get(name);
  if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    return (input as Record<string, unknown>)[name];
  }
  return undefined;
}

function numeric(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") return Number.NaN;
  if (typeof value === "string" && value.trim() === "") return Number.NaN;
  return Number(value);
}

export function validateBudget(
  input: unknown,
): { data: BudgetInput } | { errors: Record<string, string> } {
  const month = numeric(field(input, "month"));
  const year = numeric(field(input, "year"));
  const amount = numeric(field(input, "amount"));
  const errors: Record<string, string> = {};

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.month = "Bulan harus berupa angka bulat antara 1 dan 12.";
  }
  if (!Number.isInteger(year) || year < 2020 || year > 9999) {
    errors.year = "Tahun harus berupa angka bulat antara 2020 dan 9999.";
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) {
    errors.amount = "Nominal harus lebih besar dari 0 dan tidak melebihi kapasitas anggaran.";
  } else if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    errors.amount = "Nominal maksimal dua angka di belakang koma.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : { data: { month, year, amount } };
}
