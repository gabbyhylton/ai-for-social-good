import React, { useState } from "react";
import {
  Database,
  Calculator,
  LayoutGrid,
  ArrowRight,
  Loader2,
  PlusCircle,
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

interface AgentPipelineInspectorProps {
  items: EnrichedRestaurant[];
  selectedId: string;
  onSelectRestaurant: (id: string) => void;
  weights: UserMetricWeights;
  onAddAnalyzedRestaurant: (newRecord: RestaurantRecord) => void;
}

export const AgentPipelineInspector: React.FC<AgentPipelineInspectorProps> = ({
  items,
  selectedId,
  onSelectRestaurant,
  weights,
  onAddAnalyzedRestaurant,
}) => {
  const [customName, setCustomName] = useState("");
  const [customNeighborhood, setCustomNeighborhood] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const active =
    items.find((i) => i.restaurant.id === selectedId) || items[0];

  const { restaurant, evaluation } = active;

  const handleRunLivePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/agents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: customName.trim(),
          neighborhood: customNeighborhood.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.restaurant) {
        throw new Error(data.error || "Unable to analyze restaurant right now.");
      }

      const raw = data.restaurant;
      const fallbackImages = [
        "/src/assets/images/nyc_sustainable_bistro_1792777640762.jpg",
        "/src/assets/images/nyc_plant_forward_dining_1792777641598.jpg",
        "/src/assets/images/nyc_zero_waste_kitchen_1792777643568.jpg",
        "/src/assets/images/nyc_accessible_cafe_1792777643737.jpg",
      ];

      const newRecord: RestaurantRecord = {
        id: `custom-${Date.now()}`,
        name: raw.name,
        neighborhood: raw.neighborhood || customNeighborhood || "Manhattan",
        borough: raw.borough || "New York",
        address: raw.address || "New York, NY",
        cuisine: raw.cuisine || "Contemporary NYC",
        priceLevel: raw.priceLevel || "$$$",
        lat: typeof raw.lat === "number" ? raw.lat : 40.7308,
        lng: typeof raw.lng === "number" ? raw.lng : -73.9973,
        imageUrl: fallbackImages[items.length % fallbackImages.length],
        googleRating: Number(raw.googleRating) || 4.5,
        googleReviewCount: Number(raw.googleReviewCount) || 420,
        resyRating: Number(raw.resyRating) || 4.6,
        beliScore: Number(raw.beliScore) || 8.4,
        summary: raw.summary,
        buzzwords: Array.isArray(raw.buzzwords) ? raw.buzzwords : ["NYC Evaluated"],
        agent1Sources: raw.agent1Sources,
        metrics: raw.metrics,
      };

      onAddAnalyzedRestaurant(newRecord);
      setCustomName("");
      setCustomNeighborhood("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to run 3-Agent pipeline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Live 3-Agent Runner Form */}
      <section className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
        <div className="max-w-3xl">
          <div className="text-xs font-medium text-emerald-800">
            Live Multi-Agent Consolidation Runner
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-1">
            Run Agent 1, Agent 2 &amp; Agent 3 on Any New York Restaurant
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Enter any NYC restaurant below. Agent 1 aggregates Google, Resy, and Beli signals;
            Agent 2 scores each metric out of 10 with your priority weights; Agent 3 publishes it
            to the App Scorecard and NYC Maps Search.
          </p>
        </div>

        <form
          onSubmit={handleRunLivePipeline}
          className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Restaurant name (e.g., Gramercy Tavern, Superiority Burger, Katz's)..."
            className="flex-1 px-4 py-2.5 text-sm bg-[#FAF9F5] border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-700"
            disabled={isAnalyzing}
          />
          <input
            type="text"
            value={customNeighborhood}
            onChange={(e) => setCustomNeighborhood(e.target.value)}
            placeholder="Neighborhood (optional, e.g. East Village)"
            className="sm:w-64 px-4 py-2.5 text-sm bg-[#FAF9F5] border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-700"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !customName.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Consolidating Agents 1–3...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Run 3-Agent Assessment
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 text-xs text-red-700 font-medium">
            Error: {errorMsg}
          </div>
        )}

        {/* Quick-select pills to inspect existing restaurants */}
        <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500 mr-1">
            Inspect Consolidated Trace for:
          </span>
          {items.map((item) => (
            <button
              key={item.restaurant.id}
              type="button"
              onClick={() => onSelectRestaurant(item.restaurant.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                item.restaurant.id === restaurant.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {item.restaurant.name}
            </button>
          ))}
        </div>
      </section>

      {/* Visual 3-Agent Architecture Breakdown for Active Restaurant */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AGENT 1: Data Harvester */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-stone-500">
                    01. Data Harvester
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Agent 1: Multi-Platform Ingestion
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 mt-4 leading-relaxed">
              Extracts raw operational, menu, and physical accessibility signals for{" "}
              <strong className="text-stone-900">{restaurant.name}</strong> across Google Places,
              Resy, and Beli.
            </p>

            <div className="mt-5 space-y-4">
              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-stone-200">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>Google Places &amp; Reviews</span>
                  <span className="font-mono tabular-nums">
                    {restaurant.googleRating.toFixed(1)} ★ ({restaurant.googleReviewCount})
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {restaurant.agent1Sources.googleSignal}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-stone-200">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>Resy Culinary &amp; Sourcing</span>
                  <span className="font-mono tabular-nums">
                    {restaurant.resyRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {restaurant.agent1Sources.resySignal}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-stone-200">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>Beli Community Sentiment</span>
                  <span className="font-mono tabular-nums">
                    {restaurant.beliScore.toFixed(1)} / 10
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {restaurant.agent1Sources.beliSignal}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Handoff to Agent 2</span>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* AGENT 2: Weighted Scoring Engine */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/[0.08] flex items-center justify-center text-emerald-800">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-emerald-800">
                    02. Weighted Scoring Engine
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Agent 2: Priority Score Calculator
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 mt-4 leading-relaxed">
              Scores each metric out of 10, applies your onboarding focus weights, and assigns the
              Fire (&lt;3.0) or 1–3 Green Leaf rating.
            </p>

            {/* Tabular Calculation Matrix */}
            <div className="mt-5 border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b border-stone-200">
                    <th className="py-2 px-3 font-semibold">Metric</th>
                    <th className="py-2 px-2 font-semibold text-right">Raw</th>
                    <th className="py-2 px-2 font-semibold text-right">Weight</th>
                    <th className="py-2 px-3 font-semibold text-right">Weighted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono tabular-nums">
                  {evaluation.breakdown.map((row) => (
                    <tr key={row.key}>
                      <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-2 text-right text-stone-700">
                        {row.rawScore.toFixed(1)}/10
                      </td>
                      <td className="py-2.5 px-2 text-right text-emerald-800 font-semibold">
                        {row.weight}x ({row.normalizedSharePct}%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-stone-900">
                        +{row.weightedContribution.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-[#FAF9F5] border border-stone-200">
              <div className="text-xs text-stone-500">
                Consolidated Weighted Average Score
              </div>
              <div className="mt-1.5">
                <SustainabilityIconRating
                  evaluation={evaluation}
                  size="lg"
                  showVerdictText={true}
                />
              </div>
              <div className="mt-2 text-[11px] text-stone-600">
                Rule Applied:{" "}
                {evaluation.isFire
                  ? "Score < 3.0 triggers Fire Warning Icon"
                  : evaluation.weightedScore >= 8.0
                  ? "Score ≥ 8.0 awards 3 Green Leaves (Great)"
                  : evaluation.weightedScore >= 6.0
                  ? "Score 6.0–7.9 awards 2 Green Leaves (Better)"
                  : "Score 3.0–5.9 awards 1 Green Leaf (Good)"}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Handoff to Agent 3</span>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* AGENT 3: Dual Display Engine */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-stone-500">
                    03. Dual Surface Renderer
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Agent 3: App &amp; Maps Consolidation
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 mt-4 leading-relaxed">
              Packages Agent 1 &amp; Agent 2 outputs into two synchronized consumer experiences:
            </p>

            <div className="mt-5 space-y-4">
              {/* Part A preview */}
              <div className="p-4 rounded-lg bg-[#FAF9F5] border border-stone-200">
                <div className="text-xs font-bold text-stone-900">
                  Part A: In-App Detailed Scorecard &amp; Buzzwords
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Synthesizes consumer-friendly buzzwords and full 4-factor evidence cards:
                </p>
                <div className="mt-2.5 text-xs font-medium text-emerald-900">
                  {restaurant.buzzwords.join(" · ")}
                </div>
              </div>

              {/* Part B preview */}
              <div className="p-4 rounded-lg bg-[#FAF9F5] border border-stone-200">
                <div className="text-xs font-bold text-stone-900">
                  Part B: Google Maps Search Compact Overlay
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Injects the sustainability score and leaf/fire badge directly next to the Google
                  star rating in search results and map pins:
                </p>
                <div className="mt-3 p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="text-sm font-bold text-stone-900">
                    {restaurant.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="font-mono font-semibold tabular-nums text-stone-900">
                      {restaurant.googleRating.toFixed(1)} ★ ({restaurant.googleReviewCount})
                    </span>
                    <span aria-hidden="true" className="text-stone-300">
                      ·
                    </span>
                    <SustainabilityIconRating
                      evaluation={evaluation}
                      size="sm"
                      showVerdictText={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-stone-200 text-xs text-emerald-800 font-medium">
            Synchronized across App Scorecard &amp; NYC Maps Search
          </div>
        </div>
      </section>
    </div>
  );
};
