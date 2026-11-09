import React from "react";

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}

export function Chip({
  label,
  active = false,
  onClick,
  icon,
  count,
  className = "",
  size = "md",
}: ChipProps) {
  const sizeClass =
    size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-xs md:text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${sizeClass} ${
        active
          ? "bg-primary text-white shadow-sm ring-1 ring-primary"
          : "bg-white text-navy/70 hover:text-navy hover:bg-slate-100 border border-slate-200/80"
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] md:text-xs font-bold px-1.5 py-0.2 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-navy/70"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export interface PillTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface PillTabsProps {
  tabs: PillTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function PillTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: PillTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Pilihan Kategori"
      className={`flex items-center gap-2 overflow-x-auto scrollbar-none pb-1.5 -mx-1 px-1 ${className}`}
    >
      {tabs.map((tab) => (
        <Chip
          key={tab.id}
          label={tab.label}
          active={activeTab === tab.id}
          icon={tab.icon}
          count={tab.count}
          onClick={() => onChange(tab.id)}
        />
      ))}
    </div>
  );
}
