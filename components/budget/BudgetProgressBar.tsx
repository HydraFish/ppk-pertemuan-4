"use client";

import { BudgetStatus, getBudgetStatusConfig } from "@/lib/budgetUtils";

interface BudgetProgressBarProps {
  percentage: number;
  status: BudgetStatus;
  className?: string;
  showLabel?: boolean;
}

export function BudgetProgressBar({
  percentage,
  status,
  className = "",
  showLabel = true,
}: BudgetProgressBarProps) {
  const config = getBudgetStatusConfig(status);

  // Clamp bar visual width between 0% and 100% to prevent overflow during over-budget
  const clampedWidth = Math.min(Math.max(percentage, 0), 100);
  const formattedPercentage = Number.isInteger(percentage)
    ? `${percentage}%`
    : `${percentage.toFixed(1)}%`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Penggunaan Anggaran
          </span>
          <span className={`font-semibold ${config.textColor}`}>
            {formattedPercentage}
          </span>
        </div>
      )}

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Penggunaan anggaran ${formattedPercentage}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${config.barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
    </div>
  );
}
