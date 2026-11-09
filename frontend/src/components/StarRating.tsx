import { Star } from "lucide-react";
import { useState } from "react";

export interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Kurang",
  2: "Cukup",
  3: "Baik",
  4: "Sangat Baik",
  5: "Luar Biasa",
};

export default function StarRating({
  rating,
  onRatingChange,
  readOnly = false,
  size = "md",
  showLabel = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeScore = hoverRating !== null ? hoverRating : rating;

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-7 h-7 sm:w-8 sm:h-8",
    lg: "w-9 h-9 sm:w-11 sm:h-11",
  };

  const currentLabel = activeScore > 0 ? RATING_LABELS[activeScore] : "";

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* 5 Bintang Interaktif atau Read-only */}
      <div
        className="flex items-center gap-1.5 sm:gap-2.5"
        role={readOnly ? "img" : "radiogroup"}
        aria-label={`Rating ${rating} dari 5 bintang`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeScore >= star;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              className={`transition-transform focus-visible:outline-hidden ${
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-125 active:scale-95 p-1"
              }`}
              aria-label={`${star} bintang - ${RATING_LABELS[star]}`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                    : "fill-transparent text-slate-300 hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Label Deskriptif Bintang (Kurang, Cukup, Baik, Sangat Baik, Luar Biasa) */}
      {showLabel && (
        <span
          className={`text-xs sm:text-sm font-bold min-h-5 transition-opacity ${
            currentLabel
              ? "text-navy opacity-100"
              : "text-navy/40 opacity-70"
          }`}
        >
          {currentLabel || "Pilih jumlah bintang"}
        </span>
      )}
    </div>
  );
}
