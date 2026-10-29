import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Heart,
  SlidersHorizontal,
  Search,
  Plus,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { INITIAL_NYC_RESTAURANTS } from "./data/nycRestaurants";
import {
  MetricKey,
  RestaurantRecord,
  UserMetricWeights,
  UserProfile,
} from "./types/sustainability";
import {
  METRIC_METADATA,
  evaluateDualScores,
} from "./utils/scoringEngine";
import { FygsLogo } from "./components/GemPrintLogo";
import { SustainabilityIconRating } from "./components/SustainabilityIconRating";
import { MobileOnboardingFlow } from "./components/MobileOnboardingFlow";
import { MobileRestaurantSheet } from "./components/MobileRestaurantSheet";
import { MobileSettingsView } from "./components/MobileSettingsView";
import { GoogleMapsSearchSimulator } from "./components/GoogleMapsSearchSimulator";

type MobileTab = "for-you" | "near-me" | "saved" | "settings";

const STORAGE_USER_KEY = "gemprint_nyc_user_v1";
const STORAGE_WEIGHTS_KEY = "gemprint_nyc_weights_v1";
const STORAGE_SAVED_KEY = "gemprint_nyc_saved_v1";

export default function App() {
  const [restaurants, setRestaurants] = useState<RestaurantRecord[]>(
    INITIAL_NYC_RESTAURANTS
  );

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            name: "Alex Rivera",
            email: "devstar2642@gcplab.me",
            avatarInitials: "AR",
            hasCompletedOnboarding: true,
          };
    } catch {
      return {
        name: "Alex Rivera",
        email: "devstar2642@gcplab.me",
        avatarInitials: "AR",
        hasCompletedOnboarding: true,
      };
    }
  });

  const [weights, setWeights] = useState<UserMetricWeights>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WEIGHTS_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            wasteManagement: 2.5,
            operations: 1,
            plantBased: 2.5,
            accessibility: 1,
          };
    } catch {
      return {
        wasteManagement: 2.5,
        operations: 1,
        plantBased: 2.5,
        accessibility: 1,
      };
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_KEY);
      return saved
        ? JSON.parse(saved)
        : ["dirt-candy-les", "olmsted-prospect-heights"];
    } catch {
      return ["dirt-candy-les", "olmsted-prospect-heights"];
    }
  });

  const [activeTab, setActiveTab] = useState<MobileTab>("for-you");
  const [selectedId, setSelectedId] = useState<string>(
    INITIAL_NYC_RESTAURANTS[0].id
  );
  const [sheetRestaurantId, setSheetRestaurantId] = useState<string | null>(
    null
  );

  // Feed search & quick vibe filter
  const [feedSearch, setFeedSearch] = useState("");
  const [vibeFilter, setVibeFilter] = useState<
    "all" | "top" | "ada" | "plant" | "zero-waste" | "low"
  >("all");

  // Modal state for adding/looking up any NYC restaurant
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalQueryName, setModalQueryName] = useState("");
  const [modalQueryNeighborhood, setModalQueryNeighborhood] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WEIGHTS_KEY, JSON.stringify(weights));
    } catch {
      // ignore
    }
  }, [weights]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // Evaluate both locked Standard Score (baseline) and user's Personal Score
  const enrichedRestaurants = useMemo(() => {
    return restaurants.map((restaurant) => {
      const { standard, personal } = evaluateDualScores(
        restaurant.metrics,
        weights
      );
      return {
        restaurant,
        standardEvaluation: standard,
        personalEvaluation: personal,
      };
    });
  }, [restaurants, weights]);

  const filteredFeed = useMemo(() => {
    return enrichedRestaurants.filter(({ restaurant, standardEvaluation }) => {
      const q = feedSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.neighborhood.toLowerCase().includes(q) ||
        restaurant.cuisine.toLowerCase().includes(q) ||
        restaurant.buzzwords.some((b) => b.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (vibeFilter === "top") return standardEvaluation.leafCount === 3;
      if (vibeFilter === "ada")
        return (
          restaurant.metrics.accessibility.stepFreeEntrance &&
          restaurant.metrics.accessibility.accessibleBathroom
        );
      if (vibeFilter === "plant")
        return restaurant.metrics.plantBased.score >= 8.0;
      if (vibeFilter === "zero-waste")
        return restaurant.metrics.wasteManagement.score >= 8.5;
      if (vibeFilter === "low") return standardEvaluation.isFire;
      return true;
    });
  }, [enrichedRestaurants, feedSearch, vibeFilter]);

  const savedItems = useMemo(() => {
    return enrichedRestaurants.filter((item) =>
      savedIds.includes(item.restaurant.id)
    );
  }, [enrichedRestaurants, savedIds]);

  const activeSheetItem = useMemo(() => {
    if (!sheetRestaurantId) return null;
    return (
      enrichedRestaurants.find((i) => i.restaurant.id === sheetRestaurantId) ||
      null
    );
  }, [enrichedRestaurants, sheetRestaurantId]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = (prefill?: string) => {
    setModalQueryName(prefill || "");
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleAddRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalQueryName.trim()) return;

    setIsModalLoading(true);
    setModalError(null);

    try {
      const response = await fetch("/api/agents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: modalQueryName.trim(),
          neighborhood: modalQueryNeighborhood.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.restaurant) {
        throw new Error(data.error || "Unable to find restaurant right now.");
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
        neighborhood: raw.neighborhood || modalQueryNeighborhood || "Manhattan",
        borough: raw.borough || "New York",
        address: raw.address || "New York, NY",
        cuisine: raw.cuisine || "Contemporary NYC",
        priceLevel: raw.priceLevel || "$$$",
        lat: typeof raw.lat === "number" ? raw.lat : 40.7308,
        lng: typeof raw.lng === "number" ? raw.lng : -73.9973,
        imageUrl: fallbackImages[restaurants.length % fallbackImages.length],
        googleRating: Number(raw.googleRating) || 4.5,
        googleReviewCount: Number(raw.googleReviewCount) || 420,
        resyRating: Number(raw.resyRating) || 4.6,
        beliScore: Number(raw.beliScore) || 8.4,
        summary: raw.summary,
        buzzwords: Array.isArray(raw.buzzwords) ? raw.buzzwords : ["NYC Spot"],
        agent1Sources: raw.agent1Sources,
        metrics: raw.metrics,
      };

      setRestaurants((prev) => [newRecord, ...prev]);
      setSelectedId(newRecord.id);
      setSheetRestaurantId(newRecord.id);
      setIsAddModalOpen(false);
      setModalQueryName("");
      setModalQueryNeighborhood("");
    } catch (err: any) {
      setModalError(err?.message || "Could not look up restaurant.");
    } finally {
      setIsModalLoading(false);
    }
  };

  if (!user || !user.hasCompletedOnboarding) {
    return (
      <MobileOnboardingFlow
        initialWeights={weights}
        onComplete={(newProfile, nextWeights) => {
          setUser(newProfile);
          setWeights(nextWeights);
          setActiveTab("for-you");
        }}
      />
    );
  }

  const focusedLabels = (Object.keys(weights) as MetricKey[])
    .filter((k) => weights[k] > 1)
    .map((k) => METRIC_METADATA[k].shortLabel);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 pb-24">
      {/* Compact Mobile Top App Bar with fygs App Icon & Wordmark */}
      <header className="sticky top-0 z-30 h-14 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E6E1D6] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between gap-3">
          {/* Left Slot: fygs App Icon + Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab("for-you")}
            className="flex items-center gap-2.5 min-h-[44px] cursor-pointer"
          >
            <FygsLogo size="sm" variant="app-icon" />
            <span className="text-xl font-bold tracking-tight text-[#1A531A] font-display lowercase truncate">
              fygs
            </span>
          </button>

          {/* Center Slot */}
          <div className="text-xs font-medium text-stone-500 hidden sm:block truncate">
            {focusedLabels.length > 0
              ? `Personal Focus: ${focusedLabels.join(" · ")}`
              : "NYC Sustainability & Access Baseline"}
          </div>

          {/* Right Slot: Lookup Spot + User Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="min-h-[40px] px-3 rounded-xl bg-[#F7ECE8] hover:bg-[#edd8d0] text-xs font-semibold text-[#9E5840] inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lookup Spot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className="min-w-[40px] min-h-[40px] rounded-xl bg-[#1A531A] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
              title="Open Settings"
            >
              {user.avatarInitials}
            </button>
          </div>
        </div>
      </header>

      {/* Main Mobile-First Viewport Canvas */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        {/* TAB 1: FOR YOU */}
        {activeTab === "for-you" && (
          <div className="space-y-5">
            {/* Greeting + Search + Vibe Filter Bar */}
            <div className="bg-white border border-[#E6E1D6] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <FygsLogo size="md" variant="fig-mark" className="hidden xs:flex" />
                  <div>
                    <h1 className="text-xl font-bold text-stone-900 font-display tracking-tight">
                      NYC <span className="text-[#1A531A] lowercase">fygs</span> Picks
                    </h1>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Standard baseline score shown first · Personal score tailored for{" "}
                      <span className="font-semibold text-[#BD735A]">
                        {user.name.split(" ")[0]}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("near-me")}
                    className="min-h-[40px] px-3.5 rounded-xl bg-[#1A531A] text-xs font-semibold text-white hover:bg-[#0F4C35] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>NYC Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="min-h-[40px] px-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E1D6] text-xs font-semibold text-[#BD735A] hover:bg-[#F7ECE8] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                    <span>Preferences</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#BD735A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={feedSearch}
                  onChange={(e) => setFeedSearch(e.target.value)}
                  placeholder="Search NYC spots, farm-fresh, West Village..."
                  className="w-full h-11 pl-10 pr-4 text-sm bg-[#FAF9F5] border border-[#E6E1D6] rounded-2xl focus:outline-none focus:bg-white focus:border-[#1A531A]"
                />
              </div>

              {/* Clean Single-Line Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {[
                  { id: "all", label: "All NYC" },
                  { id: "top", label: "8.0+ Standard" },
                  { id: "ada", label: "Step-Free ADA" },
                  { id: "plant", label: "Plant-Forward" },
                  { id: "zero-waste", label: "Zero-Waste" },
                  { id: "low", label: "Below 3.0" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setVibeFilter(chip.id as any)}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      vibeFilter === chip.id
                        ? "bg-[#1A531A] text-white"
                        : "bg-[#FAF9F5] border border-[#E6E1D6] text-stone-600 hover:border-[#BD735A]/60 hover:text-stone-900"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Restaurant Cards Grid */}
            {filteredFeed.length === 0 ? (
              <div className="bg-white border border-[#E6E1D6] rounded-3xl p-8 text-center space-y-3">
                <p className="text-sm font-medium text-stone-800">
                  No spots match &ldquo;{feedSearch}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(feedSearch)}
                  className="min-h-[44px] px-5 rounded-2xl bg-[#1A531A] text-white text-xs font-semibold cursor-pointer"
                >
                  Look Up &ldquo;{feedSearch}&rdquo; in NYC
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeed.map(
                  ({ restaurant, standardEvaluation, personalEvaluation }) => {
                    const isSaved = savedIds.includes(restaurant.id);
                    return (
                      <article
                        key={restaurant.id}
                        onClick={() => setSheetRestaurantId(restaurant.id)}
                        className="bg-white border border-[#E6E1D6] rounded-3xl overflow-hidden shadow-xs hover:border-[#BD735A] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Photo Header */}
                          <div className="relative h-48 w-full bg-stone-200">
                            <img
                              src={restaurant.imageUrl}
                              alt={restaurant.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                            {/* Save Heart Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(restaurant.id);
                              }}
                              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-[#FAF9F5]/95 backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer"
                              aria-label="Save restaurant"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isSaved
                                    ? "fill-[#BD735A] text-[#BD735A]"
                                    : "text-stone-700"
                                }`}
                              />
                            </button>

                            {/* Bottom Photo Overlay: Neighborhood & Price */}
                            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                              <div>
                                <div className="text-[11px] text-stone-200">
                                  {restaurant.neighborhood} · {restaurant.cuisine} ·{" "}
                                  {restaurant.priceLevel}
                                </div>
                                <h2 className="text-lg font-bold tracking-tight font-display">
                                  {restaurant.name}
                                </h2>
                              </div>
                            </div>
                          </div>

                          {/* Card Body: Prominent Standard Score + Secondary Personal Score (No Resy/Beli or verbal tier text) */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-semibold text-[#1A531A]">
                                  Standard Score
                                </div>
                                <SustainabilityIconRating
                                  evaluation={standardEvaluation}
                                  size="md"
                                />
                              </div>

                              <div className="text-right pl-3 border-l border-[#E6E1D6]">
                                <div className="text-[10px] font-semibold text-[#BD735A]">
                                  Personal Score
                                </div>
                                <span className="font-mono text-sm font-bold tabular-nums text-[#BD735A]">
                                  {personalEvaluation.weightedScore.toFixed(1)}
                                  <span className="text-xs text-stone-400 font-normal">
                                    /10
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Clean Unboxed Buzzwords */}
                            <div className="text-xs font-semibold text-[#1A531A] line-clamp-1">
                              {restaurant.buzzwords.slice(0, 4).join("  ·  ")}
                            </div>

                            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                              {restaurant.summary}
                            </p>
                          </div>
                        </div>

                        {/* Clean 4-Pillar Mini Snapshot Footer */}
                        <div className="px-4 py-3 bg-[#FAF9F5] border-t border-[#E6E1D6] grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-[10px] text-stone-500">Waste</div>
                            <div className="text-xs font-mono font-bold tabular-nums text-[#1A531A]">
                              {restaurant.metrics.wasteManagement.score.toFixed(1)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500">Clean Ops</div>
                            <div className="text-xs font-mono font-bold tabular-nums text-[#1A531A]">
                              {restaurant.metrics.operations.score.toFixed(1)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500">Plant</div>
                            <div className="text-xs font-mono font-bold tabular-nums text-[#1A531A]">
                              {restaurant.metrics.plantBased.score.toFixed(1)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500">Access</div>
                            <div className="text-xs font-mono font-bold tabular-nums text-[#1A531A]">
                              {restaurant.metrics.accessibility.score.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NEAR ME */}
        {activeTab === "near-me" && (
          <GoogleMapsSearchSimulator
            items={enrichedRestaurants}
            selectedId={selectedId}
            onSelectRestaurant={setSelectedId}
            onOpenDetailSheet={(id) => setSheetRestaurantId(id)}
            onOpenAnalyzeModal={handleOpenAddModal}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        )}

        {/* TAB 3: SAVED */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E6E1D6] rounded-3xl p-5 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-stone-900 font-display">
                  Your Saved NYC Spots ({savedItems.length})
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tap any spot to view its Standard &amp; Personal <span className="lowercase font-semibold text-[#1A531A]">fygs</span> scores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("for-you")}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#1A531A] text-white text-xs font-semibold cursor-pointer"
              >
                Browse More
              </button>
            </div>

            {savedItems.length === 0 ? (
              <div className="bg-white border border-[#E6E1D6] rounded-3xl p-10 text-center space-y-3">
                <Heart className="w-8 h-8 text-[#BD735A]/50 mx-auto" />
                <div className="text-sm font-bold text-stone-800">
                  No saved restaurants yet
                </div>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Tap the heart icon on any restaurant in For You or Near Me to save it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedItems.map(
                  ({ restaurant, standardEvaluation, personalEvaluation }) => (
                    <div
                      key={restaurant.id}
                      onClick={() => setSheetRestaurantId(restaurant.id)}
                      className="bg-white border border-[#E6E1D6] rounded-3xl p-4 flex items-center justify-between gap-4 hover:border-[#BD735A] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="text-base font-bold text-stone-900 truncate">
                            {restaurant.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2.5">
                            <SustainabilityIconRating
                              evaluation={standardEvaluation}
                              size="sm"
                            />
                            <span className="text-xs font-mono text-[#BD735A] font-semibold">
                              · Personal: {personalEvaluation.weightedScore.toFixed(1)}/10
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 truncate mt-1">
                            {restaurant.neighborhood} ·{" "}
                            {restaurant.buzzwords.slice(0, 2).join(" · ")}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(restaurant.id);
                        }}
                        className="min-w-[44px] min-h-[44px] rounded-full bg-[#F7ECE8] text-[#BD735A] flex items-center justify-center shrink-0 cursor-pointer"
                        aria-label="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-[#BD735A] text-[#BD735A]" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <MobileSettingsView
            user={user}
            weights={weights}
            onChangeWeights={setWeights}
            onSignOut={() => setUser(null)}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E6E1D6]"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 items-center h-16 px-2">
          {[
            {
              id: "for-you",
              label: "For You",
              icon: Sparkles,
            },
            {
              id: "near-me",
              label: "Near Me",
              icon: MapPin,
            },
            {
              id: "saved",
              label: "Saved",
              icon: Heart,
            },
            {
              id: "settings",
              label: "Settings",
              icon: SlidersHorizontal,
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as MobileTab)}
                className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? "text-[#1A531A] font-bold"
                    : "text-stone-400 hover:text-[#BD735A] font-medium"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${
                    isActive ? "stroke-[2.5px] text-[#1A531A]" : "stroke-2"
                  }`}
                />
                <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-Up Mobile Bottom Sheet for Restaurant Details */}
      {activeSheetItem && (
        <MobileRestaurantSheet
          restaurant={activeSheetItem.restaurant}
          standardEvaluation={activeSheetItem.standardEvaluation}
          personalEvaluation={activeSheetItem.personalEvaluation}
          isSaved={savedIds.includes(activeSheetItem.restaurant.id)}
          onToggleSave={toggleSave}
          onClose={() => setSheetRestaurantId(null)}
          onShowOnMap={(id) => {
            setSelectedId(id);
            setSheetRestaurantId(null);
            setActiveTab("near-me");
          }}
        />
      )}

      {/* Simple Modal to Lookup / Add Any NYC Restaurant */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E6E1D6] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
              <div className="flex items-center gap-2">
                <FygsLogo size="sm" variant="fig-mark" />
                <h3 className="text-base font-bold text-stone-900">
                  Look Up Any NYC Restaurant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRestaurantSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={modalQueryName}
                  onChange={(e) => setModalQueryName(e.target.value)}
                  placeholder="e.g., Superiority Burger, Gramercy Tavern..."
                  className="w-full h-11 px-3.5 text-sm bg-[#FAF9F5] border border-[#E6E1D6] rounded-2xl focus:outline-none focus:bg-white focus:border-[#1A531A]"
                  disabled={isModalLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Neighborhood (Optional)
                </label>
                <input
                  type="text"
                  value={modalQueryNeighborhood}
                  onChange={(e) => setModalQueryNeighborhood(e.target.value)}
                  placeholder="e.g., East Village, Williamsburg"
                  className="w-full h-11 px-3.5 text-sm bg-[#FAF9F5] border border-[#E6E1D6] rounded-2xl focus:outline-none focus:bg-white focus:border-[#1A531A]"
                  disabled={isModalLoading}
                />
              </div>

              {modalError && (
                <div className="text-xs text-[#9E5840] font-medium">
                  {modalError}
                </div>
              )}

              <button
                type="submit"
                disabled={isModalLoading || !modalQueryName.trim()}
                className="w-full min-h-[48px] rounded-2xl bg-[#1A531A] hover:bg-[#0F4C35] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isModalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scoring Restaurant...</span>
                  </>
                ) : (
                  <span>Get fygs Score</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
