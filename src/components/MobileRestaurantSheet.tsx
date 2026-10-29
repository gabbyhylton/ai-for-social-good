import React from "react";
import {
  X,
  MapPin,
  Heart,
  CheckCircle2,
  XCircle,
  Recycle,
  Sun,
  Sprout,
  Accessibility,
  Map,
} from "lucide-react";
import { RestaurantRecord, ScoreEvaluation } from "../types/sustainability";
import { SustainabilityIconRating } from "./SustainabilityIconRating";

interface MobileRestaurantSheetProps {
  restaurant: RestaurantRecord;
  standardEvaluation: ScoreEvaluation;
  personalEvaluation: ScoreEvaluation;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onShowOnMap: (id: string) => void;
}

export const MobileRestaurantSheet: React.FC<MobileRestaurantSheetProps> = ({
  restaurant,
  standardEvaluation,
  personalEvaluation,
  isSaved,
  onToggleSave,
  onClose,
  onShowOnMap,
}) => {
  const { wasteManagement, operations, plantBased, accessibility } =
    restaurant.metrics;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] bg-[#FAF9F5] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-[#E6E1D6]"
      >
        {/* Drag Handle for Mobile Sheet */}
        <div className="pt-2.5 pb-1 bg-[#FAF9F5] sm:hidden">
          <div className="w-10 h-1.5 bg-[#BD735A]/40 rounded-full mx-auto" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Photo Header */}
          <div className="relative h-56 w-full bg-stone-200">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {/* Top Action Buttons (Min 44x44px hitboxes) */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onToggleSave(restaurant.id)}
                className="min-w-[44px] min-h-[44px] rounded-full bg-[#FAF9F5]/95 backdrop-blur-md text-stone-900 flex items-center justify-center shadow-sm cursor-pointer"
                aria-label="Save restaurant"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSaved
                      ? "fill-[#BD735A] text-[#BD735A]"
                      : "text-stone-700"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] rounded-full bg-[#FAF9F5]/95 backdrop-blur-md text-stone-900 flex items-center justify-center shadow-sm cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <div className="text-xs text-stone-200">
                {restaurant.neighborhood} · {restaurant.cuisine} · {restaurant.priceLevel}
              </div>
              <h2 className="text-2xl font-bold tracking-tight font-display mt-0.5">
                {restaurant.name}
              </h2>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Prominent Standard Score + Secondary Personal Score */}
            <div className="p-4 rounded-2xl bg-white border border-[#E6E1D6] flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#1A531A]">
                  Standard Score
                </div>
                <div className="mt-1">
                  <SustainabilityIconRating
                    evaluation={standardEvaluation}
                    size="lg"
                  />
                </div>
              </div>

              <div className="pl-4 border-l border-[#E6E1D6] text-right">
                <div className="text-[11px] font-semibold text-[#BD735A]">
                  Personal Score
                </div>
                <div className="mt-1 inline-flex items-center justify-end">
                  <SustainabilityIconRating
                    evaluation={personalEvaluation}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Buzzwords & Summary */}
            <div>
              <div className="text-xs font-semibold text-[#1A531A] leading-relaxed">
                {restaurant.buzzwords.join("  ·  ")}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed mt-2.5">
                {restaurant.summary}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
                <MapPin className="w-3.5 h-3.5 text-[#BD735A] shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            </div>

            {/* Simple, Scannable 4-Pillar Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">
                Sustainability &amp; Accessibility Breakdown
              </h3>

              {/* 1. Accessibility */}
              <div className="p-4 rounded-2xl border border-[#E6E1D6] bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Accessibility className="w-4 h-4 text-[#1A531A]" />
                    <span>Accessibility</span>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#1A531A]">
                    {accessibility.score.toFixed(1)}
                    <span className="text-xs text-stone-400 font-normal">/10</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1 text-stone-700">
                    {accessibility.stepFreeEntrance ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1A531A] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#BD735A] shrink-0" />
                    )}
                    <span>Step-Free</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-700">
                    {accessibility.accessibleBathroom ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1A531A] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#BD735A] shrink-0" />
                    )}
                    <span>ADA Bath</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-700">
                    {accessibility.handicapSeating ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1A531A] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#BD735A] shrink-0" />
                    )}
                    <span>Seating</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500">{accessibility.evidence}</p>
              </div>

              {/* 2. Waste Reduction */}
              <div className="p-4 rounded-2xl border border-[#E6E1D6] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Recycle className="w-4 h-4 text-[#1A531A]" />
                    <span>Waste Reduction</span>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#1A531A]">
                    {wasteManagement.score.toFixed(1)}
                    <span className="text-xs text-stone-400 font-normal">/10</span>
                  </span>
                </div>
                <div className="text-xs text-stone-700">
                  {wasteManagement.composting ? "Composts Organics" : "No Composting"} ·{" "}
                  {wasteManagement.zeroSingleUsePlastic ? "Plastic-Free" : "Uses Plastic"} ·{" "}
                  {wasteManagement.foodRescuePartner}
                </div>
                <p className="text-xs text-stone-500">{wasteManagement.evidence}</p>
              </div>

              {/* 3. Plant-Based Options */}
              <div className="p-4 rounded-2xl border border-[#E6E1D6] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Sprout className="w-4 h-4 text-[#1A531A]" />
                    <span>Plant-Forward Options</span>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#1A531A]">
                    {plantBased.score.toFixed(1)}
                    <span className="text-xs text-stone-400 font-normal">/10</span>
                  </span>
                </div>
                <div className="text-xs text-stone-700">
                  {plantBased.plantMenuSharePct}% Plant-Forward Menu · Try:{" "}
                  <strong className="font-medium text-stone-900">
                    {plantBased.signaturePlantDish}
                  </strong>
                </div>
                <p className="text-xs text-stone-500">{plantBased.evidence}</p>
              </div>

              {/* 4. Operations & Sourcing */}
              <div className="p-4 rounded-2xl border border-[#E6E1D6] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Sun className="w-4 h-4 text-[#BD735A]" />
                    <span>Farm Sourcing &amp; Clean Ops</span>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#1A531A]">
                    {operations.score.toFixed(1)}
                    <span className="text-xs text-stone-400 font-normal">/10</span>
                  </span>
                </div>
                <div className="text-xs text-stone-700">
                  {operations.localSourcingPct}% Local Farms · {operations.energyEfficiency}
                </div>
                <p className="text-xs text-stone-500">{operations.evidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="p-4 border-t border-[#E6E1D6] bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={() => onShowOnMap(restaurant.id)}
            className="flex-1 min-h-[48px] rounded-2xl bg-[#1A531A] hover:bg-[#0F4C35] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>Pin on NYC Map</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(restaurant.id)}
            className={`min-h-[48px] px-5 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              isSaved
                ? "border-[#BD735A] bg-[#F7ECE8] text-[#9E5840]"
                : "border-[#E6E1D6] bg-[#FAF9F5] text-stone-800"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? "fill-[#BD735A] text-[#BD735A]" : ""
              }`}
            />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
