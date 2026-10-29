import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import {
  RestaurantRecord,
  ScoreEvaluation,
  UserMetricWeights,
} from "../types/sustainability";
import { SustainabilityIconRating } from "./SustainabilityIconRating";

interface EnrichedRestaurant {
  restaurant: RestaurantRecord;
  evaluation: ScoreEvaluation;
}

interface AppScorecardViewProps {
  items: EnrichedRestaurant[];
  selectedId: string;
  onSelectRestaurant: (id: string) => void;
  weights: UserMetricWeights;
  onSwitchToMap: (id: string) => void;
  onSwitchToAgents: (id: string) => void;
  onOpenAnalyzeModal: (prefill?: string) => void;
}

export const AppScorecardView: React.FC<AppScorecardViewProps> = ({
  items,
  selectedId,
  onSelectRestaurant,
  weights,
  onSwitchToMap,
  onSwitchToAgents,
  onOpenAnalyzeModal,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "great" | "good-better" | "bad" | "accessible">("all");
  const [searchText, setSearchText] = useState("");

  const filtered = items.filter(({ restaurant, evaluation }) => {
    const q = searchText.trim().toLowerCase();
    const matchesText =
      !q ||
      restaurant.name.toLowerCase().includes(q) ||
      restaurant.neighborhood.toLowerCase().includes(q) ||
      restaurant.cuisine.toLowerCase().includes(q) ||
      restaurant.buzzwords.some((b) => b.toLowerCase().includes(q));

    if (!matchesText) return false;

    if (filterMode === "great") return evaluation.weightedScore >= 8.0;
    if (filterMode === "good-better")
      return evaluation.weightedScore >= 3.0 && evaluation.weightedScore < 8.0;
    if (filterMode === "bad") return evaluation.isFire;
    if (filterMode === "accessible")
      return (
        restaurant.metrics.accessibility.stepFreeEntrance &&
        restaurant.metrics.accessibility.accessibleBathroom &&
        restaurant.metrics.accessibility.handicapSeating
      );
    return true;
  });

  const active =
    items.find((i) => i.restaurant.id === selectedId) || filtered[0] || items[0];

  const { restaurant, evaluation } = active;
  const { wasteManagement, operations, plantBased, accessibility } = restaurant.metrics;

  return (
    <div className="space-y-8">
      {/* Directory Filter & Restaurant Selector Strip */}
      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div>
            <div className="text-xs font-medium text-emerald-800">
              Agent 3 · Part A — In-App Detailed Sustainability Scorecard &amp; Buzzwords
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              New York City Restaurant Sustainability Directory ({filtered.length} Venues)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Filter by name, neighborhood, buzzword..."
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-700 w-64"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
              {[
                { id: "all", label: "All Rated" },
                { id: "great", label: "3 Leaves (8.0+)" },
                { id: "good-better", label: "1–2 Leaves (3–7.9)" },
                { id: "bad", label: "Fire (<3.0)" },
                { id: "accessible", label: "Full ADA" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setFilterMode(btn.id as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterMode === btn.id
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Selectable Restaurant Cards */}
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-stone-700">
              No NYC restaurants in the current filter match &ldquo;{searchText}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => onOpenAnalyzeModal(searchText)}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Analyze &ldquo;{searchText}&rdquo; Live with 3-Agent Pipeline
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            {filtered.map((item) => {
              const isSelected = item.restaurant.id === restaurant.id;
              return (
                <button
                  key={item.restaurant.id}
                  type="button"
                  onClick={() => onSelectRestaurant(item.restaurant.id)}
                  className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-800 bg-emerald-950/[0.04]"
                      : "border-stone-200 hover:border-stone-300 bg-[#FAF9F5]/40"
                  }`}
                >
                  <div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {item.restaurant.neighborhood} · {item.restaurant.priceLevel}
                    </div>
                    <div className="text-sm font-bold text-stone-900 truncate mt-0.5">
                      {item.restaurant.name}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200/70">
                    <SustainabilityIconRating
                      evaluation={item.evaluation}
                      size="sm"
                      showVerdictText={false}
                    />
                    <div className="text-[11px] text-stone-600 mt-1 truncate">
                      {item.evaluation.shortLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Selected Restaurant Detailed Scorecard (Part A Core Display) */}
      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {/* Top Hero Split of Selected Restaurant */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch border-b border-stone-200">
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span>{restaurant.borough}</span>
                <span aria-hidden="true">·</span>
                <span>{restaurant.neighborhood}</span>
                <span aria-hidden="true">·</span>
                <span>{restaurant.cuisine}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{restaurant.priceLevel}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-2">
                {restaurant.name}
              </h2>

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{restaurant.address}</span>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed mt-4 max-w-2xl">
                {restaurant.summary}
              </p>

              {/* Curated Sustainability Buzzwords (Clean Unboxed Editorial Typography) */}
              <div className="mt-5 pt-4 border-t border-stone-200">
                <div className="text-xs font-semibold text-stone-900 mb-1.5">
                  Verified Sustainability &amp; Accessibility Buzzwords
                </div>
                <div className="text-xs font-medium text-emerald-900 leading-relaxed">
                  {restaurant.buzzwords.join("  ·  ")}
                </div>
              </div>
            </div>

            {/* Cross-Platform Ratings Consolidated by Agent 1 */}
            <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-xs">
                <div>
                  <span className="text-stone-500">Google Rating: </span>
                  <strong className="font-mono tabular-nums text-stone-900 inline-flex items-center gap-1">
                    {restaurant.googleRating.toFixed(1)}
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  </strong>
                  <span className="text-stone-400 font-mono ml-1">
                    ({restaurant.googleReviewCount.toLocaleString()})
                  </span>
                </div>
                <span aria-hidden="true" className="text-stone-300">
                  /
                </span>
                <div>
                  <span className="text-stone-500">Resy: </span>
                  <strong className="font-mono tabular-nums text-stone-900">
                    {restaurant.resyRating.toFixed(1)} / 5.0
                  </strong>
                </div>
                <span aria-hidden="true" className="text-stone-300">
                  /
                </span>
                <div>
                  <span className="text-stone-500">Beli Score: </span>
                  <strong className="font-mono tabular-nums text-stone-900">
                    {restaurant.beliScore.toFixed(1)} / 10
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSwitchToMap(restaurant.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View on Maps Search
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchToAgents(restaurant.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-950/[0.06] hover:bg-emerald-950/[0.12] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Inspect 3-Agent Data
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Image + Agent 2 Consolidated Score Box */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col justify-between bg-[#FAF9F5]">
            <div className="h-56 lg:h-64 w-full bg-stone-200 overflow-hidden relative">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                <div className="text-white">
                  <div className="text-[11px] font-medium opacity-85">
                    Agent 2 Weighted Verdict
                  </div>
                  <div className="text-base font-bold">
                    {evaluation.verdictTitle}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-stone-600">
                    Personalized Sustainability Score
                  </span>
                  <span className="text-xs font-mono tabular-nums text-stone-500">
                    Unweighted Avg: {evaluation.unweightedScore.toFixed(1)}/10
                  </span>
                </div>

                <div className="mt-2">
                  <SustainabilityIconRating
                    evaluation={evaluation}
                    size="lg"
                    showVerdictText={true}
                  />
                </div>

                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                  {evaluation.verdictDetail}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Weights: Waste {weights.wasteManagement}x · Ops {weights.operations}x · Plant{" "}
                  {weights.plantBased}x · Access {weights.accessibility}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Sustainability Metrics Breakdown (Each Scored Out of 10) */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                4-Factor Sustainability &amp; Accessibility Breakdown (Scored out of 10)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Consolidated by Agent 1 (Google, Resy, Beli) and weighted by Agent 2
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Waste Management / Waste Reduction */}
            <div className="p-5 rounded-lg border border-stone-200 bg-[#FAF9F5]/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-stone-500">
                      01. Priority Weight: {weights.wasteManagement}x
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Waste Management &amp; Reduction
                    </h4>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-xl font-bold ${
                        wasteManagement.score < 3
                          ? "text-red-700"
                          : wasteManagement.score >= 8
                          ? "text-emerald-800"
                          : "text-stone-900"
                      }`}
                    >
                      {wasteManagement.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-400"> / 10</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      wasteManagement.score < 3
                        ? "bg-red-600"
                        : wasteManagement.score >= 8
                        ? "bg-emerald-700"
                        : "bg-amber-600"
                    }`}
                    style={{ width: `${Math.min(100, wasteManagement.score * 10)}%` }}
                  />
                </div>

                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  {wasteManagement.evidence}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-stone-500 text-[11px]">Composting</div>
                  <div className="font-semibold text-stone-900 inline-flex items-center gap-1 mt-0.5">
                    {wasteManagement.composting ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        No
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Zero Plastic</div>
                  <div className="font-semibold text-stone-900 inline-flex items-center gap-1 mt-0.5">
                    {wasteManagement.zeroSingleUsePlastic ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        Conventional
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Food Rescue</div>
                  <div className="font-semibold text-stone-900 truncate mt-0.5" title={wasteManagement.foodRescuePartner}>
                    {wasteManagement.foodRescuePartner}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Operations (Sourcing, Energy Efficiency, Water Usage) */}
            <div className="p-5 rounded-lg border border-stone-200 bg-[#FAF9F5]/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-stone-500">
                      02. Priority Weight: {weights.operations}x
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Operations (Sourcing, Energy &amp; Water)
                    </h4>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-xl font-bold ${
                        operations.score < 3
                          ? "text-red-700"
                          : operations.score >= 8
                          ? "text-emerald-800"
                          : "text-stone-900"
                      }`}
                    >
                      {operations.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-400"> / 10</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      operations.score < 3
                        ? "bg-red-600"
                        : operations.score >= 8
                        ? "bg-emerald-700"
                        : "bg-amber-600"
                    }`}
                    style={{ width: `${Math.min(100, operations.score * 10)}%` }}
                  />
                </div>

                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  {operations.evidence}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-stone-500 text-[11px]">Local Sourcing</div>
                  <div className="font-mono font-semibold tabular-nums text-stone-900 mt-0.5">
                    {operations.localSourcingPct}% Regional
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Energy Efficiency</div>
                  <div className="font-semibold text-stone-900 truncate mt-0.5" title={operations.energyEfficiency}>
                    {operations.energyEfficiency}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Water Usage</div>
                  <div className="font-semibold text-stone-900 truncate mt-0.5" title={operations.waterUsageGrade}>
                    {operations.waterUsageGrade}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Plant-Based Options */}
            <div className="p-5 rounded-lg border border-stone-200 bg-[#FAF9F5]/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-stone-500">
                      03. Priority Weight: {weights.plantBased}x
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Plant-Based Options
                    </h4>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-xl font-bold ${
                        plantBased.score < 3
                          ? "text-red-700"
                          : plantBased.score >= 8
                          ? "text-emerald-800"
                          : "text-stone-900"
                      }`}
                    >
                      {plantBased.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-400"> / 10</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      plantBased.score < 3
                        ? "bg-red-600"
                        : plantBased.score >= 8
                        ? "bg-emerald-700"
                        : "bg-amber-600"
                    }`}
                    style={{ width: `${Math.min(100, plantBased.score * 10)}%` }}
                  />
                </div>

                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  {plantBased.evidence}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-stone-500 text-[11px]">Plant-Forward Menu Share</div>
                  <div className="font-mono font-semibold tabular-nums text-stone-900 mt-0.5">
                    {plantBased.plantMenuSharePct}% of Menu
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Standout Plant Dish (Beli/Resy)</div>
                  <div className="font-semibold text-stone-900 truncate mt-0.5" title={plantBased.signaturePlantDish}>
                    {plantBased.signaturePlantDish}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Accessibility (Step-Free Entrance, Accessible Bathroom, Handicap Seating) */}
            <div className="p-5 rounded-lg border border-stone-200 bg-[#FAF9F5]/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-stone-500">
                      04. Priority Weight: {weights.accessibility}x
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Accessibility (Entrance, Bathroom &amp; Seating)
                    </h4>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-xl font-bold ${
                        accessibility.score < 3
                          ? "text-red-700"
                          : accessibility.score >= 8
                          ? "text-emerald-800"
                          : "text-stone-900"
                      }`}
                    >
                      {accessibility.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-400"> / 10</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      accessibility.score < 3
                        ? "bg-red-600"
                        : accessibility.score >= 8
                        ? "bg-emerald-700"
                        : "bg-amber-600"
                    }`}
                    style={{ width: `${Math.min(100, accessibility.score * 10)}%` }}
                  />
                </div>

                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  {accessibility.evidence}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-stone-500 text-[11px]">Step-Free Entrance</div>
                  <div className="font-semibold text-stone-900 inline-flex items-center gap-1 mt-0.5">
                    {accessibility.stepFreeEntrance ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Stairs Only
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Accessible Bathroom</div>
                  <div className="font-semibold text-stone-900 inline-flex items-center gap-1 mt-0.5">
                    {accessibility.accessibleBathroom ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        ADA Compliant
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        No
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 text-[11px]">Handicap Seating</div>
                  <div className="font-semibold text-stone-900 inline-flex items-center gap-1 mt-0.5">
                    {accessibility.handicapSeating ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Cramped
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
