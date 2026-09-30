"use client";

import { useEffect, useState, FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import { getIndonesianMonthName } from "@/lib/budgetUtils";

export interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: number;
  currentYear: number;
  currentAmount: number | null;
  onSuccess: () => void;
}

function SetBudgetModalDialog({
  onClose,
  currentMonth,
  currentYear,
  currentAmount,
  onSuccess,
}: Omit<SetBudgetModalProps, "isOpen">) {
  const [amountStr, setAmountStr] = useState<string>(
    currentAmount && currentAmount > 0 ? String(currentAmount) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const parsedAmount = Number(amountStr);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= 1000;
  const isEditing = currentAmount !== null && currentAmount > 0;
  const monthName = getIndonesianMonthName(currentMonth);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amountStr.trim()) {
      setErrorMessage("Silakan masukkan nominal anggaran.");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Nominal anggaran harus lebih besar dari 0.");
      return;
    }

    if (parsedAmount < 1000) {
      setErrorMessage("Nominal anggaran minimal Rp 1.000.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: currentMonth,
          year: currentYear,
          amount: parsedAmount,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorDetail =
          data?.error || data?.message || "Gagal menyimpan anggaran. Silakan coba lagi.";
        setErrorMessage(errorDetail);
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onClose();
      onSuccess();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan. Periksa koneksi Anda dan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-background p-6 shadow-xl dark:border-zinc-800">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-foreground">
              {isEditing ? "Ubah Anggaran Bulanan" : "Tetapkan Anggaran Bulanan"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Periode: {monthName} {currentYear}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup modal"
            className="rounded-lg p-1 text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900"
            >
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="budget-amount-input"
              className="block text-sm font-medium text-foreground"
            >
              Target Anggaran Pengeluaran (Rp)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-zinc-400">
                Rp
              </span>
              <input
                id="budget-amount-input"
                name="amount"
                type="number"
                min="1000"
                step="1"
                required
                autoFocus
                placeholder="Contoh: 1500000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isSubmitting}
                className="w-full rounded-md border border-zinc-300 py-2 pr-3 pl-10 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
              />
            </div>

            {/* Real-time formatted currency preview */}
            <div className="min-h-5 pt-0.5">
              {amountStr.trim() !== "" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Preview:{" "}
                  {isValidAmount ? (
                    <span className="font-semibold text-foreground">
                      {formatRupiah(parsedAmount)}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Minimal nominal adalah Rp 1.000
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SetBudgetModal({ isOpen, ...props }: SetBudgetModalProps) {
  if (!isOpen) return null;
  return (
    <SetBudgetModalDialog
      key={`${props.currentMonth}-${props.currentYear}-${props.currentAmount}`}
      {...props}
    />
  );
}
