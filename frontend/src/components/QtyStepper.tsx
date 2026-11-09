import React from "react";
import { Minus, Plus } from "lucide-react";

export interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  disabled = false,
  className = "",
  ariaLabel = "Jumlah item",
}: QtyStepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const sizeClasses = {
    sm: {
      btn: "w-7 h-7 text-xs",
      icon: "w-3 h-3 stroke-[2.5]",
      text: "text-xs min-w-6",
      wrap: "gap-1 p-0.5",
    },
    md: {
      btn: "w-8 h-8 text-sm",
      icon: "w-3.5 h-3.5 stroke-[2.5]",
      text: "text-sm min-w-8",
      wrap: "gap-1.5 p-1",
    },
    lg: {
      btn: "w-10 h-10 text-base",
      icon: "w-4 h-4 stroke-[2.5]",
      text: "text-base min-w-10",
      wrap: "gap-2 p-1.5",
    },
  }[size];

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  return (
    <div
      className={`inline-flex items-center bg-surface border border-blue-100 rounded-full select-none ${sizeClasses.wrap} ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={`rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
          sizeClasses.btn
        } ${
          canDecrement
            ? "bg-white text-navy hover:bg-slate-100 active:scale-90 shadow-xs"
            : "bg-transparent text-navy/30 cursor-not-allowed"
        }`}
        aria-label="Kurangi satu"
      >
        <Minus className={sizeClasses.icon} aria-hidden="true" />
      </button>

      <span
        className={`font-bold text-navy text-center tabular-nums px-1 ${sizeClasses.text}`}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={`rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
          sizeClasses.btn
        } ${
          canIncrement
            ? "bg-primary text-white hover:bg-blue-bright active:scale-90 shadow-xs"
            : "bg-slate-200 text-navy/30 cursor-not-allowed"
        }`}
        aria-label="Tambah satu"
      >
        <Plus className={sizeClasses.icon} aria-hidden="true" />
      </button>
    </div>
  );
}
