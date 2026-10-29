import React from "react";
import {
  Leaf,
  Flame,
  RotateCcw,
  LogOut,
  Info,
  SlidersHorizontal,
  Cpu,
  Database,
  Calculator,
  MapPin,
  ArrowDown,
} from "lucide-react";
import {
  MetricKey,
  UserMetricWeights,
  UserProfile,
} from "../types/sustainability";
import {
  DEFAULT_WEIGHTS,
  METRIC_METADATA,
  STANDARD_THRESHOLDS,
} from "../utils/scoringEngine";

interface MobileSettingsViewProps {
  user: UserProfile;
  weights: UserMetricWeights;
  onChangeWeights: (next: UserMetricWeights) => void;
  onSignOut: () => void;
}

const METRIC_KEYS: MetricKey[] = [
  "wasteManagement",
  "operations",
  "plantBased",
  "accessibility",
];

export const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({
  user,
  weights,
  onChangeWeights,
  onSignOut,
}) => {
  const totalWeight = METRIC_KEYS.reduce((s, k) => s + weights[k], 0);

  const setMetricWeight = (key: MetricKey, val: number) => {
    onChangeWeights({
      ...weights,
      [key]: val,
    });
  };

  const resetPersonalWeights = () => {
    onChangeWeights({ ...DEFAULT_WEIGHTS });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Connected Google Account Card */}
      <section className="bg-white border border-[#E6E1D6] rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#1A531A] text-white font-bold text-base flex items-center justify-center shrink-0">
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold text-stone-900 truncate">
              {user.name}
            </div>
            <div className="text-xs text-stone-500 truncate">
              Connected via Google · {user.email}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E1D6] hover:bg-[#F7ECE8] text-xs font-semibold text-stone-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* 2. Personal Score Preferences (Custom Weights for Personal Score Only) */}
      <section className="bg-white border border-[#E6E1D6] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#1A531A]" />
              <h2 className="text-base font-bold text-stone-900">
                Personal Score Preferences
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Adjust your focus weights below to customize your secondary{" "}
              <strong className="text-[#BD735A]">Personal Score</strong>. The primary{" "}
              <strong className="text-[#1A531A]">Standard Score</strong> stays fixed as a fair
              baseline across all NYC restaurants.
            </p>
          </div>
          <button
            type="button"
            onClick={resetPersonalWeights}
            className="min-h-[40px] px-3 rounded-xl bg-[#FAF9F5] border border-[#E6E1D6] hover:bg-[#F7ECE8] text-xs font-medium text-stone-700 inline-flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-3">
          {METRIC_KEYS.map((key) => {
            const meta = METRIC_METADATA[key];
            const w = weights[key];
            const sharePct = Math.round((w / totalWeight) * 100);

            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">
                      {meta.friendlyTitle}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-[#BD735A] font-semibold">
                      {sharePct}% personal weight
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {meta.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#E6E1D6]/60 p-1 rounded-xl self-start sm:self-center shrink-0">
                  {[
                    { label: "1x", val: 1 },
                    { label: "2.5x", val: 2.5 },
                    { label: "3.5x", val: 3.5 },
                  ].map((opt) => {
                    const active = Math.abs(w - opt.val) < 0.2;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setMetricWeight(key, opt.val)}
                        className={`min-h-[36px] px-3 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          active
                            ? "bg-[#1A531A] text-white font-semibold"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. How the 3 Agents Work Behind the Scenes (BTS) */}
      <section className="bg-white border border-[#E6E1D6] rounded-3xl p-5 sm:p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#1A531A]" />
            <h2 className="text-base font-bold text-stone-900">
              Behind the Scenes: How Our 3 Agents Work
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Every NYC restaurant in <strong className="text-[#1A531A] lowercase">fygs</strong> is processed through a three-agent pipeline that
            turns messy public dining data into a simple, comparable sustainability footprint.
          </p>
        </div>

        <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed">
          {/* Agent 1 */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1A531A] text-white flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-[#1A531A] font-semibold">
                  Agent 1 · Data Harvester
                </div>
                <div className="text-sm font-bold text-stone-900">
                  Google, Resy &amp; Beli Signal Collection
                </div>
              </div>
            </div>
            <p className="mt-2.5">
              Gathers and cross-references venue signals across <strong>Google</strong>,{" "}
              <strong>Resy</strong>, and <strong>Beli</strong> to collect evidence for four core
              factors: <strong>Waste Management</strong> (composting, plastic reduction, food
              rescue), <strong>Operations</strong> (local farm sourcing, kitchen energy efficiency,
              water usage), <strong>Plant-Based Options</strong>, and{" "}
              <strong>Accessibility</strong> (step-free entrance, accessible bathroom, handicap
              seating).
            </p>
          </div>

          <div className="flex justify-center text-[#BD735A]">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Agent 2 */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#BD735A] text-white flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-[#BD735A] font-semibold">
                  Agent 2 · Scoring &amp; Weighting Engine
                </div>
                <div className="text-sm font-bold text-stone-900">
                  Standard Baseline &amp; Personal Score Calculation
                </div>
              </div>
            </div>
            <p className="mt-2.5">
              Grades each of the four factors out of <strong>10</strong>. It first calculates the
              locked equal-weight <strong>Standard Score</strong> (so all NYC restaurants share a
              fair baseline) and then applies your onboarding preferences to calculate your{" "}
              <strong>Personal Score</strong>, mapping the result to the Fire (&lt;3.0) or 1–3
              Green Leaf icons.
            </p>
          </div>

          <div className="flex justify-center text-[#BD735A]">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Agent 3 */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1A531A] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-[#1A531A] font-semibold">
                  Agent 3 · Experience Consolidator
                </div>
                <div className="text-sm font-bold text-stone-900">
                  In-App Scorecard &amp; Live NYC Map Pins
                </div>
              </div>
            </div>
            <p className="mt-2.5">
              Consolidates the scores into two simple views: <strong>Part A</strong> (clean in-app
              restaurant cards with quick buzzwords like <em>Farm-Fresh</em>,{" "}
              <em>Zero-Trimming Kitchen</em>, and <em>Step-Free ADA</em>) and{" "}
              <strong>Part B</strong> (interactive NYC map pins showing each restaurant&apos;s
              rating right beside its sustainability score).
            </p>
          </div>
        </div>
      </section>

      {/* 4. How Standard & Personal Scores Are Calculated & Rated */}
      <section className="bg-white border border-[#E6E1D6] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1A531A]" />
          <h2 className="text-base font-bold text-stone-900">
            How <span className="lowercase text-[#1A531A]">fygs</span> Scores &amp; Ratings Work
          </h2>
        </div>

        <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6]">
            <div className="font-bold text-stone-900 mb-1">
              1. Standard Score (Universal Baseline)
            </div>
            <p>
              To ensure every New York restaurant is compared on an equal footing, the prominent{" "}
              <strong className="text-[#1A531A]">Standard Score</strong> weights all four pillars equally (25% Waste Reduction,
              25% Operations &amp; Sourcing, 25% Plant-Based Options, 25% Accessibility), each
              scored out of 10.
            </p>
            <div className="mt-2 font-mono text-[11px] text-stone-800 bg-white p-2.5 rounded-xl border border-[#E6E1D6]">
              Standard Score = (Waste + Operations + Plant-Based + Accessibility) ÷ 4
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6]">
            <div className="font-bold text-stone-900 mb-1">
              2. Personal Score (Tailored to Your Priorities)
            </div>
            <p>
              Displayed alongside the Standard Score on every restaurant view, your{" "}
              <strong className="text-[#BD735A]">Personal Score</strong> applies the custom preference multipliers you selected
              above so you can see how well a spot aligns with your specific values.
            </p>
            <div className="mt-2 font-mono text-[11px] text-stone-800 bg-white p-2.5 rounded-xl border border-[#E6E1D6]">
              Personal Score = Σ(Pillar Score × Personal Weight) ÷ Total Weight
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6] space-y-2.5">
            <div className="font-bold text-stone-900">
              3. Locked Standard Rating Scale
            </div>
            <p>
              Leaf and Fire icons are determined by fixed baseline thresholds out of 10:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#E6E1D6] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-semibold text-[#9E5840]">
                  <Flame className="w-4 h-4 fill-[#BD735A] text-[#9E5840]" />
                  <Flame className="w-4 h-4 fill-amber-500 text-[#BD735A] -ml-2" />
                  <span>Low Score</span>
                </span>
                <span className="font-mono tabular-nums">
                  Below {STANDARD_THRESHOLDS.fireCutoff.toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1D6] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-semibold text-[#1A531A]">
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35]" />
                  <span>1 Leaf</span>
                </span>
                <span className="font-mono tabular-nums">
                  {STANDARD_THRESHOLDS.fireCutoff.toFixed(1)} –{" "}
                  {(STANDARD_THRESHOLDS.twoLeafCutoff - 0.1).toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1D6] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-semibold text-[#1A531A]">
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35]" />
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35] -ml-1" />
                  <span>2 Leaves</span>
                </span>
                <span className="font-mono tabular-nums">
                  {STANDARD_THRESHOLDS.twoLeafCutoff.toFixed(1)} –{" "}
                  {(STANDARD_THRESHOLDS.threeLeafCutoff - 0.1).toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1D6] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-semibold text-[#1A531A]">
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35]" />
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35] -ml-1" />
                  <Leaf className="w-4 h-4 fill-[#1A531A] text-[#0F4C35] -ml-1" />
                  <span>3 Leaves</span>
                </span>
                <span className="font-mono tabular-nums">
                  {STANDARD_THRESHOLDS.threeLeafCutoff.toFixed(1)} – 10.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
