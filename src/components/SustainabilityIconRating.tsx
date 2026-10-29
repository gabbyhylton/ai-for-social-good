import React from "react";
import { Flame, Leaf } from "lucide-react";
import { ScoreEvaluation } from "../types/sustainability";

interface SustainabilityIconRatingProps {
  evaluation: ScoreEvaluation;
  size?: "sm" | "md" | "lg";
}

/**
 * Displays the numeric score out of 10 alongside the Fire or Leaf icons
 * using the fygs Forest Emerald (#1A531A) and Fig Terracotta (#BD735A) palette,
 * without any verbal tier labels ("3 Leaves", "Great", etc.).
 */
export const SustainabilityIconRating: React.FC<SustainabilityIconRatingProps> = ({
  evaluation,
  size = "md",
}) => {
  const { weightedScore, isFire, leafCount } = evaluation;

  const iconSize =
    size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const scoreClass =
    size === "lg"
      ? "text-2xl font-bold font-mono tabular-nums"
      : size === "md"
      ? "text-base font-bold font-mono tabular-nums"
      : "text-xs font-bold font-mono tabular-nums";

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`${scoreClass} ${
          isFire
            ? "text-[#9E5840]"
            : weightedScore >= 8.0
            ? "text-[#1A531A]"
            : weightedScore >= 6.0
            ? "text-[#1A531A]"
            : "text-[#BD735A]"
        }`}
      >
        {weightedScore.toFixed(1)}
        <span className="text-stone-400 font-normal text-xs">/10</span>
      </span>

      {isFire ? (
        <span className="inline-flex items-center text-[#BD735A]">
          <Flame className={`${iconSize} fill-[#BD735A] text-[#9E5840] shrink-0`} />
          <Flame
            className={`${iconSize} fill-amber-500 text-[#BD735A] -ml-1.5 shrink-0`}
          />
        </span>
      ) : (
        <span className="inline-flex items-center gap-0.5">
          {[1, 2, 3].map((idx) => {
            const active = idx <= leafCount;
            return (
              <Leaf
                key={idx}
                className={`${iconSize} shrink-0 ${
                  active
                    ? "fill-[#1A531A] text-[#0F4C35]"
                    : "text-[#E6E1D6] fill-[#FAF9F5]"
                }`}
              />
            );
          })}
        </span>
      )}
    </div>
  );
};
