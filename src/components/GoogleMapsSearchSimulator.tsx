import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  Search,
  Star,
  Plus,
  Heart,
  Navigation,
  Layers,
  Menu,
  X,
  Info,
  Share2,
  Check,
  Calendar,
  MoreVertical,
  Accessibility,
} from "lucide-react";
import {
  RestaurantRecord,
  ScoreEvaluation,
} from "../types/sustainability";
import { SustainabilityIconRating } from "./SustainabilityIconRating";
import { FygsLogo } from "./GemPrintLogo";

interface EnrichedRestaurant {
  restaurant: RestaurantRecord;
  standardEvaluation: ScoreEvaluation;
  personalEvaluation: ScoreEvaluation;
}

interface GoogleMapsSearchSimulatorProps {
  items: EnrichedRestaurant[];
  selectedId: string;
  onSelectRestaurant: (id: string) => void;
  onOpenDetailSheet: (id: string) => void;
  onOpenAnalyzeModal: (prefillQuery?: string) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  compact?: boolean;
}

const NYC_REGIONS: {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
}[] = [
  { id: "all-nyc", label: "All NYC", center: [40.742, -73.968], zoom: 12 },
  { id: "uptown", label: "Uptown & Harlem", center: [40.798, -73.955], zoom: 13 },
  { id: "midtown-flatiron", label: "Midtown & Flatiron", center: [40.749, -73.988], zoom: 14 },
  { id: "downtown", label: "Village, SoHo & LES", center: [40.725, -73.997], zoom: 14 },
  { id: "brooklyn", label: "Brooklyn", center: [40.695, -73.962], zoom: 13 },
  { id: "queens", label: "Queens", center: [40.7618, -73.9245], zoom: 14 },
];

// Watermark-free OpenStreetMap & Esri Street Map tile providers
const TILE_PROVIDERS = {
  osm: {
    label: "OSM Street Map",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  clean: {
    label: "Clean Light Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  },
};

const CLOSING_TIMES = [
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:30 PM",
  "10:00 PM",
  "10:30 PM",
  "9:30 PM",
];

export const GoogleMapsSearchSimulator: React.FC<GoogleMapsSearchSimulatorProps> = ({
  items,
  selectedId,
  onSelectRestaurant,
  onOpenDetailSheet,
  onOpenAnalyzeModal,
  savedIds,
  onToggleSave,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("restaurants near me");
  const [tierFilter, setTierFilter] = useState<"all" | "top" | "mid" | "low" | "ada">("all");
  const [activeRegion, setActiveRegion] = useState("all-nyc");
  const [tileStyle, setTileStyle] = useState<"osm" | "clean">("osm");
  const [mobileViewMode, setMobileViewMode] = useState<"split" | "results" | "map">("split");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const normalizedFilterQuery =
    searchQuery.trim().toLowerCase() === "restaurants near me"
      ? ""
      : searchQuery.trim().toLowerCase();

  const filteredItems = items.filter(({ restaurant, standardEvaluation }) => {
    const q = normalizedFilterQuery;
    const matchesSearch =
      !q ||
      restaurant.name.toLowerCase().includes(q) ||
      restaurant.neighborhood.toLowerCase().includes(q) ||
      restaurant.borough.toLowerCase().includes(q) ||
      restaurant.cuisine.toLowerCase().includes(q) ||
      restaurant.buzzwords.some((b) => b.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (tierFilter === "top") return standardEvaluation.leafCount === 3;
    if (tierFilter === "mid")
      return !standardEvaluation.isFire && standardEvaluation.leafCount < 3;
    if (tierFilter === "low") return standardEvaluation.isFire;
    if (tierFilter === "ada")
      return (
        restaurant.metrics.accessibility.stepFreeEntrance &&
        restaurant.metrics.accessibility.accessibleBathroom
      );
    return true;
  });

  // Initialize New York City Leaflet Map (Watermark-free OpenStreetMap tiles, fit to All NYC)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [40.742, -73.968],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    const initialTileLayer = L.tileLayer(TILE_PROVIDERS.osm.url, {
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = initialTileLayer;
    markersLayerRef.current = markersGroup;

    if (items.length > 0) {
      const bounds = L.latLngBounds(
        items.map((i) => [i.restaurant.lat, i.restaurant.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
    }

    const t1 = setTimeout(() => map.invalidateSize(), 60);
    const t2 = setTimeout(() => map.invalidateSize(), 250);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [compact]);

  // Recalculate size when switching view modes on mobile
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 80);
    return () => clearTimeout(timer);
  }, [mobileViewMode]);

  // Switch between OSM Street Map and Esri World Street Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(TILE_PROVIDERS[tileStyle].url, {
      maxZoom: 19,
    }).addTo(map);
  }, [tileStyle]);

  // Render compact, non-overlapping Leaflet markers for every NYC restaurant in fygs palette
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    filteredItems.forEach(({ restaurant, standardEvaluation, personalEvaluation }) => {
      const isSelected = restaurant.id === selectedId && activeRegion !== "all-nyc";
      const { weightedScore, isFire, leafCount } = standardEvaluation;

      const leafSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#1A531A" stroke="#0F4C35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
      const fireSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#BD735A" stroke="#9E5840" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;

      const iconsMarkup = isFire
        ? `${fireSvg}`
        : Array.from({ length: leafCount })
            .map(() => leafSvg)
            .join("");

      const borderColor = isSelected
        ? "#1A531A"
        : isFire
        ? "#BD735A"
        : leafCount === 3
        ? "#1A531A"
        : "#BD735A";

      const bgColor = isSelected
        ? "#1A531A"
        : isFire
        ? "#F7ECE8"
        : "#FAF9F5";

      const textColor = isSelected ? "#FAF9F5" : "#1c1917";

      const pinHtml = `
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 7px;
          border-radius: 9999px;
          background: ${bgColor};
          color: ${textColor};
          border: 1.5px solid ${borderColor};
          box-shadow: 0 3px 8px rgba(26,83,26,0.22);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span>${restaurant.googleRating.toFixed(1)}★</span>
          <span style="opacity: 0.35;">|</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: ${
            isSelected ? "#F4F0E0" : isFire ? "#9E5840" : "#1A531A"
          };">${weightedScore.toFixed(1)}</span>
          <span style="display:inline-flex;align-items:center;gap:1px;">${iconsMarkup}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "verdant-map-pin",
        html: pinHtml,
        iconSize: [96, 26],
        iconAnchor: [48, 13],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon: customIcon,
      });

      const popupHtml = `
        <div style="padding: 12px; font-family: 'Public Sans', sans-serif; background: #FAF9F5;">
          <div style="font-size: 11px; color: #78716c;">${restaurant.neighborhood} · ${restaurant.priceLevel}</div>
          <div style="font-size: 14px; font-weight: 700; color: #1c1917; margin-top: 2px;">${restaurant.name}</div>
          <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <span style="color: #1A531A;"><strong>Standard: ${weightedScore.toFixed(1)}/10</strong> ${iconsMarkup}</span>
            <span style="color: #BD735A; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Personal: ${personalEvaluation.weightedScore.toFixed(1)}</span>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #1A531A; font-weight: 600;">
            ${restaurant.buzzwords.slice(0, 3).join(" · ")}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on("click", () => {
        onSelectRestaurant(restaurant.id);
      });

      layerGroup.addLayer(marker);
    });
  }, [filteredItems, selectedId, activeRegion, onSelectRestaurant]);

  const activeItem =
    items.find((i) => i.restaurant.id === selectedId) || filteredItems[0] || items[0];

  const handleSelectRegion = (region: (typeof NYC_REGIONS)[number]) => {
    setActiveRegion(region.id);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (region.id === "all-nyc" && filteredItems.length > 0) {
      const bounds = L.latLngBounds(
        filteredItems.map(
          (i) => [i.restaurant.lat, i.restaurant.lng] as [number, number]
        )
      );
      map.flyToBounds(bounds, { padding: [45, 45], maxZoom: 12, duration: 0.6 });
    } else {
      map.flyTo(region.center, region.zoom, { duration: 0.6 });
    }
  };

  const handleClickRestaurantRow = (id: string, lat: number, lng: number) => {
    onSelectRestaurant(id);
    setActiveRegion("custom");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.5 });
    }
  };

  const renderFiveStars = (rating: number) => {
    const fullStars = Math.round(rating);
    return (
      <span className="inline-flex items-center gap-0.5 align-middle">
        {[1, 2, 3, 4, 5].map((idx) => (
          <Star
            key={idx}
            className={`w-3.5 h-3.5 ${
              idx <= fullStars
                ? "fill-[#fbbc04] text-[#fbbc04]"
                : "fill-stone-200 text-stone-300"
            }`}
          />
        ))}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Region Bar */}
      <div className="bg-white border border-[#E6E1D6] rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-display">
              &ldquo;Restaurants Near Me&rdquo; + <span className="text-[#1A531A] lowercase">fygs</span> Overlay
            </h2>
            <p className="text-xs text-stone-500">
              See how <strong className="text-[#1A531A] lowercase">fygs</strong> sustainability scores appear directly inside search results &amp; on the NYC map
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile view switcher */}
            <div className="inline-flex lg:hidden rounded-xl bg-[#FAF9F5] border border-[#E6E1D6] p-1">
              {[
                { id: "split", label: "Both" },
                { id: "results", label: "Search List" },
                { id: "map", label: "NYC Map" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMobileViewMode(mode.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    mobileViewMode === mode.id
                      ? "bg-[#1A531A] text-white shadow-2xs"
                      : "text-stone-600"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setTileStyle((prev) => (prev === "osm" ? "clean" : "osm"))
              }
              className="min-h-[38px] px-3 rounded-xl bg-[#FAF9F5] border border-[#E6E1D6] text-stone-700 hover:bg-[#F7ECE8] flex items-center justify-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
              title="Switch Map Layer"
            >
              <Layers className="w-3.5 h-3.5 text-[#1A531A]" />
              <span className="hidden sm:inline">
                {TILE_PROVIDERS[tileStyle].label}
              </span>
            </button>
          </div>
        </div>

        {/* NYC Neighborhood Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {NYC_REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => handleSelectRegion(region)}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                activeRegion === region.id
                  ? "bg-[#1A531A] text-white"
                  : "bg-[#FAF9F5] border border-[#E6E1D6] text-stone-700 hover:bg-[#F7ECE8]"
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>{region.label}</span>
            </button>
          ))}
        </div>

        {/* Score Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#E6E1D6]/60">
          {[
            { id: "all", label: "All NYC" },
            { id: "top", label: "8.0+ Score" },
            { id: "mid", label: "3.0–7.9 Score" },
            { id: "low", label: "Below 3.0" },
            { id: "ada", label: "Step-Free ADA" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTierFilter(tab.id as any)}
              className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tierFilter === tab.id
                  ? "bg-[#BD735A] text-white"
                  : "bg-[#FAF9F5] border border-[#E6E1D6] text-stone-600 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: Authentic "restaurants near me" Search Mockup + Interactive NYC Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: "restaurants near me" Search Results Mockup with fygs Rating */}
        <div
          className={`lg:col-span-5 bg-white border border-[#E6E1D6] rounded-[28px] overflow-hidden shadow-sm flex flex-col ${
            mobileViewMode === "map" ? "hidden lg:flex" : "flex"
          }`}
          style={{ maxHeight: compact ? "520px" : "680px" }}
        >
          {/* Search Bar Header ("restaurants near me") */}
          <div className="p-3.5 pb-2.5 bg-white border-b border-[#E6E1D6]/70 sticky top-0 z-10">
            <div className="flex items-center h-12 px-4 rounded-full border border-[#E6E1D6] bg-[#FAF9F5] shadow-2xs gap-3">
              <Menu className="w-5 h-5 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="restaurants near me"
                className="flex-1 text-[15px] text-stone-900 bg-transparent focus:outline-none"
              />
              <Search className="w-5 h-5 text-[#1A531A] shrink-0" />
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* "Results (i)" and "Share" Row */}
            <div className="flex items-center justify-between px-1 pt-3 pb-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-semibold text-[#1f1f1f]">
                  Results
                </span>
                <Info className="w-4 h-4 text-stone-500" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAnalyzeModal("")}
                  className="text-xs font-semibold text-[#1A531A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Spot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("restaurants near me")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#BD735A] hover:opacity-80 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable "restaurants near me" Result Cards with fygs Rating */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E6E1D6]/70">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm font-medium text-stone-800">
                  No matches for &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAnalyzeModal(searchQuery)}
                  className="min-h-[44px] px-4 rounded-2xl bg-[#1A531A] text-white text-xs font-semibold cursor-pointer"
                >
                  Look Up &ldquo;{searchQuery}&rdquo; in NYC
                </button>
              </div>
            ) : (
              filteredItems.map(
                ({ restaurant, standardEvaluation, personalEvaluation }, idx) => {
                  const isSelected = restaurant.id === selectedId;
                  const isSaved = savedIds.includes(restaurant.id);
                  const closingTime =
                    CLOSING_TIMES[idx % CLOSING_TIMES.length];
                  const isStepFree =
                    restaurant.metrics.accessibility.stepFreeEntrance;

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() =>
                        handleClickRestaurantRow(
                          restaurant.id,
                          restaurant.lat,
                          restaurant.lng
                        )
                      }
                      className={`p-4 transition-colors cursor-pointer ${
                        isSelected ? "bg-[#FAF9F5]" : "hover:bg-[#FAF9F5]/60"
                      }`}
                    >
                      {idx === 0 && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-[#1f1f1f]">
                            Sponsored
                          </span>
                          <MoreVertical className="w-3.5 h-3.5 text-stone-500" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        {/* Left Details Column */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[17px] font-medium text-[#1f1f1f] leading-snug">
                              {restaurant.name}
                            </h3>
                          </div>

                          {/* Google Rating + fygs Sustainability Score Inline */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-[#5e5e5e]">
                            <span className="inline-flex items-center gap-1">
                              <span className="font-normal text-[#1f1f1f]">
                                {restaurant.googleRating.toFixed(1)}
                              </span>
                              {renderFiveStars(restaurant.googleRating)}
                              <span>({restaurant.googleReviewCount})</span>
                              <span>· {restaurant.priceLevel}</span>
                            </span>

                            {/* fygs Rating Badge embedded right next to Google Rating */}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDetailSheet(restaurant.id);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-semibold ${
                                standardEvaluation.isFire
                                  ? "bg-[#F7ECE8] border-[#BD735A]/50 text-[#9E5840]"
                                  : "bg-[#FAF9F5] border-[#1A531A]/30 text-[#1A531A]"
                              }`}
                              title="fygs Standard & Personal Sustainability Score"
                            >
                              <FygsLogo size="sm" className="!w-4 !h-4 !rounded-md" />
                              <span className="lowercase font-bold text-[#1A531A]">fygs</span>
                              <SustainabilityIconRating
                                evaluation={standardEvaluation}
                                size="sm"
                              />
                              <span className="text-[11px] font-mono text-[#BD735A] pl-1 border-l border-[#E6E1D6]">
                                You: {personalEvaluation.weightedScore.toFixed(1)}
                              </span>
                            </span>
                          </div>

                          {/* Cuisine · Accessibility Icon · Street Address */}
                          <div className="mt-1 text-[13px] text-[#5e5e5e] flex flex-wrap items-center gap-1">
                            <span>{restaurant.cuisine}</span>
                            {isStepFree && (
                              <>
                                <span>·</span>
                                <span
                                  className="inline-flex items-center text-[#1A531A]"
                                  title="Step-free accessible entrance"
                                >
                                  <Accessibility className="w-3.5 h-3.5" />
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span>{restaurant.address.replace(", New York, NY", "")}</span>
                          </div>

                          {/* Editorial Summary Line */}
                          <div className="mt-0.5 text-[13px] text-[#5e5e5e] line-clamp-1">
                            {restaurant.summary}
                          </div>

                          {/* Open · Closes Time */}
                          <div className="mt-0.5 text-[13px] text-[#5e5e5e]">
                            <span className="text-[#1A531A] font-medium">
                              Open
                            </span>{" "}
                            · Closes {closingTime}
                          </div>
                        </div>

                        {/* Right Thumbnail Photo + Save Heart */}
                        <div className="relative shrink-0">
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            referrerPolicy="no-referrer"
                            className="w-[84px] h-[84px] rounded-2xl object-cover bg-stone-200"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSave(restaurant.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white/95 shadow-xs border border-[#E6E1D6] flex items-center justify-center cursor-pointer"
                            aria-label="Save restaurant"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isSaved
                                  ? "fill-[#BD735A] text-[#BD735A]"
                                  : "text-stone-600"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {idx % 2 === 0 ? (
                        <div className="mt-2.5 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#5e5e5e]">
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#1A531A]" />
                              <span>Dine-in</span>
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#1A531A]" />
                              <span>{restaurant.buzzwords[0] || "Composting"}</span>
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#1A531A]" />
                              <span>{restaurant.buzzwords[1] || "Local Farms"}</span>
                            </span>
                          </div>

                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetailSheet(restaurant.id);
                            }}
                            className="rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6] p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-[#1A531A] truncate">
                                fygs Sustainability Breakdown
                              </div>
                              <div className="text-[12px] text-[#474747] line-clamp-2 mt-0.5">
                                Waste {restaurant.metrics.wasteManagement.score.toFixed(1)} · Ops{" "}
                                {restaurant.metrics.operations.score.toFixed(1)} · Plant{" "}
                                {restaurant.metrics.plantBased.score.toFixed(1)} · Access{" "}
                                {restaurant.metrics.accessibility.score.toFixed(1)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDetailSheet(restaurant.id);
                              }}
                              className="px-4 py-2 rounded-full bg-[#1A531A] hover:bg-[#0F4C35] text-white text-xs font-semibold shrink-0 cursor-pointer"
                            >
                              View Score
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 space-y-2.5">
                          <div className="flex items-start gap-2 text-[13px] text-[#5e5e5e]">
                            <span className="w-5 h-5 rounded-full bg-[#BD735A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              f
                            </span>
                            <p className="line-clamp-2">
                              &ldquo;{restaurant.metrics.operations.sourcingNote} —{" "}
                              {restaurant.buzzwords.slice(0, 2).join(" & ")}.&rdquo;
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetailSheet(restaurant.id);
                            }}
                            className="w-full h-9 rounded-full bg-[#F7ECE8] hover:bg-[#edd8d0] text-[#9E5840] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Reserve a table · fygs {standardEvaluation.weightedScore.toFixed(1)}/10</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive New York City Leaflet Map */}
        <div
          className={`lg:col-span-7 relative rounded-[28px] overflow-hidden border border-[#E6E1D6] bg-[#FAF9F5] shadow-xs ${
            mobileViewMode === "results" ? "hidden lg:block" : "block"
          }`}
          style={{ height: compact ? "460px" : "680px" }}
        >
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Floating Selected Restaurant Card at Bottom of Leaflet Map */}
          {activeItem && (
            <div
              onClick={() => onOpenDetailSheet(activeItem.restaurant.id)}
              className="absolute bottom-3 left-3 right-3 z-[400] bg-[#FAF9F5]/95 backdrop-blur-md border border-[#E6E1D6] rounded-2xl p-3.5 shadow-lg cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeItem.restaurant.imageUrl}
                  alt={activeItem.restaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-200"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-stone-900 truncate">
                    {activeItem.restaurant.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <SustainabilityIconRating
                      evaluation={activeItem.standardEvaluation}
                      size="sm"
                    />
                    <span className="text-[11px] font-mono text-[#BD735A] font-semibold">
                      · Personal: {activeItem.personalEvaluation.weightedScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate mt-0.5">
                    {activeItem.restaurant.neighborhood} · {activeItem.restaurant.address}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetailSheet(activeItem.restaurant.id);
                }}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#1A531A] text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
