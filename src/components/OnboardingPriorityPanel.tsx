import React from "react";
import { Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { MetricKey, UserMetricWeights } from "../types/sustainability";
import { DEFAULT_WEIGHTS, METRIC_METADATA } from "../utils/scoringEngine";

interface OnboardingPriorityPanelProps {
  weights: UserMetricWeights;
  onChangeWeights: (next: UserMetricWeights) => void;
  hasCompletedOnboarding: boolean;
  onCompleteOnboarding: () => void;
}

const METRIC_KEYS: MetricKey[] = [
  "wasteManagement",
  "operations",
  "plantBased",
  "accessibility",
];

export const OnboardingPriorityPanel: React.FC<OnboardingPriorityPanelProps> = ({
  weights,
  onChangeWeights,
  hasCompletedOnboarding,
  onCompleteOnboarding,
}) => {
  const toggleFocusMetric = (key: MetricKey) => {
    const current = weights[key];
    // Toggle between standard 1x weight and prioritized 2.5x weight
    const nextWeight = current > 1 ? 1 : 2.5;
    onChangeWeights({
      ...weights,
      [key]: nextWeight,
    });
  };

  const setExactWeight = (key: MetricKey, val: number) => {
    onChangeWeights({
      ...weights,
      [key]: val,
    });
  };

  const resetWeights = () => {
    onChangeWeights({ ...DEFAULT_WEIGHTS });
  };

  const totalWeight = METRIC_KEYS.reduce((sum, k) => sum + weights[k], 0);
  const focusedCount = METRIC_KEYS.filter((k) => weights[k] > 1).length;

  return (
    <section
      id="priorities"
      className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 transition-colors"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-stone-200">
        <div className="max-w-2xl">
          <div className="text-xs font-medium text-emerald-800 mb-1.5">
            Agent 2 Onboarding · Personalized Sustainability Weighting
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
            Which sustainability & accessibility factors matter most to you?
          </h2>
          <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
            Select your priority metrics below. Agent 2 dynamically increases the weight of your
            chosen priorities when computing each NYC restaurant&apos;s overall score out of 10.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={resetWeights}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Equal Weights (1x)
          </button>
          {!hasCompletedOnboarding && (
            <button
              type="button"
              onClick={onCompleteOnboarding}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save My Priorities ({focusedCount} Focused)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {METRIC_KEYS.map((key) => {
          const meta = METRIC_METADATA[key];
          const weight = weights[key];
          const isFocused = weight > 1;
          const sharePct = Math.round((weight / totalWeight) * 100);

          return (
            <div
              key={key}
              className={`flex flex-col justify-between p-4 rounded-lg border transition-colors ${
                isFocused
                  ? "border-emerald-700 bg-emerald-950/[0.03]"
                  : "border-stone-200 bg-[#FAF9F5]/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFocusMetric(key)}
                    className="text-left group cursor-pointer"
                  >
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {meta.label}
                    </h3>
                  </button>
                  <span className="font-mono text-xs font-semibold tabular-nums text-emerald-800 shrink-0">
                    {sharePct}% share
                  </span>
                </div>

                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  {meta.subtitle}
                </p>

                <div className="mt-3 text-[11px] text-stone-500">
                  {meta.factors.join(" · ")}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleFocusMetric(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isFocused
                      ? "bg-emerald-800 text-white"
                      : "bg-white border border-stone-300 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  {isFocused ? "Focused Priority" : "Focus Metric"}
                </button>

                <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-md">
                  {[
                    { label: "1x", val: 1 },
                    { label: "2x", val: 2 },
                    { label: "3x", val: 3 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setExactWeight(key, opt.val)}
                      className={`px-2 py-1 text-[11px] font-mono tabular-nums rounded transition-colors cursor-pointer ${
                        Math.abs(weight - opt.val) < 0.3
                          ? "bg-white text-stone-900 font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>
            Agent 2 Rating Scale:{" "}
            <strong className="text-red-700 font-semibold">&lt; 3.0 Fire Warning</strong> ·{" "}
            <strong className="text-stone-800 font-semibold">3.0–5.9 (1 Green Leaf · Good)</strong> ·{" "}
            <strong className="text-emerald-800 font-semibold">6.0–7.9 (2 Green Leaves · Better)</strong> ·{" "}
            <strong className="text-emerald-900 font-semibold">8.0+ (3 Green Leaves · Great)</strong>
          </span>
        </div>
        <div className="font-mono tabular-nums text-stone-500">
          Active Formula: Σ(Metric × Priority Weight) / {totalWeight.toFixed(1)}
        </div>
      </div>
    </section>
  );
};
