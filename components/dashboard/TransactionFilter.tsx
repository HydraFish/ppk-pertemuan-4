"use client";

import { useEffect, useId, useRef, useState } from "react";

export type TransactionFilterState = {
  type: "all" | "income" | "expense";
  category: string;
  month: number; // 0 = semua bulan
  year: number; // 0 = semua tahun
};

export const DEFAULT_FILTER: TransactionFilterState = {
  type: "all",
  category: "",
  month: 0,
  year: 0,
};

export const CATEGORY_SUGGESTIONS = [
  "Makanan",
  "Transportasi",
  "Pendidikan",
  "Hiburan",
  "Uang Saku",
  "Freelance",
  "Internet",
];

const TYPE_OPTIONS: { value: TransactionFilterState["type"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const CATEGORY_DEBOUNCE_MS = 300;

type Props = {
  filter: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
  onReset: () => void;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function TransactionFilter({ filter, onChange, onReset }: Props) {
  const uid = useId();
  const [currentYear] = useState(() => new Date().getFullYear());
  const [categoryInput, setCategoryInput] = useState(filter.category);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  function cancelPendingCategory() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }

  // Every non-category change cancels the pending debounce and carries the
  // text currently typed, so a late timer can never overwrite a newer filter.
  function emit(patch: Partial<TransactionFilterState>) {
    cancelPendingCategory();
    onChange({ ...filter, category: categoryInput.trim(), ...patch });
  }

  function handleCategoryChange(value: string) {
    setCategoryInput(value);
    cancelPendingCategory();
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      onChange({ ...filter, category: value.trim() });
    }, CATEGORY_DEBOUNCE_MS);
  }

  function handleMonthChange(month: number) {
    emit({ month, year: month > 0 && filter.year === 0 ? currentYear : filter.year });
  }

  function handleYearChange(year: number) {
    emit({ year, month: year === 0 ? 0 : filter.month });
  }

  function handleReset() {
    cancelPendingCategory();
    setCategoryInput("");
    onReset();
  }

  const years = [0, ...Array.from({ length: 5 }, (_, i) => currentYear - i)];

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div role="group" aria-label="Jenis transaksi" className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter.type === option.value}
            onClick={() => emit({ type: option.value })}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
              (filter.type === option.value
                ? "border-foreground bg-foreground text-background"
                : "border-zinc-300 hover:bg-black/[.04] dark:border-zinc-700 dark:hover:bg-white/[.06]")
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor={`${uid}-category`} className="text-sm font-medium">
            Kategori
          </label>
          <input
            id={`${uid}-category`}
            type="text"
            list={`${uid}-categories`}
            maxLength={50}
            value={categoryInput}
            onChange={(event) => handleCategoryChange(event.target.value)}
            placeholder="Semua kategori"
            className={fieldClass}
          />
          <datalist id={`${uid}-categories`}>
            {CATEGORY_SUGGESTIONS.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <label htmlFor={`${uid}-month`} className="text-sm font-medium">
            Bulan
          </label>
          <select
            id={`${uid}-month`}
            value={filter.month}
            onChange={(event) => handleMonthChange(Number(event.target.value))}
            className={fieldClass}
          >
            <option value={0}>Semua bulan</option>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor={`${uid}-year`} className="text-sm font-medium">
            Tahun
          </label>
          <select
            id={`${uid}-year`}
            value={filter.year}
            onChange={(event) => handleYearChange(Number(event.target.value))}
            className={fieldClass}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year === 0 ? "Semua tahun" : year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="text-sm font-medium underline"
      >
        Atur ulang filter
      </button>
    </div>
  );
}
