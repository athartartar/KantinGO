import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backTo?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  onBack,
  backTo,
  rightAction,
  className = "",
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 md:py-4 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 active:scale-90 border border-slate-200/80 text-navy flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
        </button>

        <div className="truncate">
          <h1 className="text-lg md:text-xl font-extrabold text-navy tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-navy/60 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}
