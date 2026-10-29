export type MetricKey = "wasteManagement" | "operations" | "plantBased" | "accessibility";

export interface WasteManagementMetric {
  score: number; // 0 - 10
  composting: boolean;
  zeroSingleUsePlastic: boolean;
  foodRescuePartner: string;
  evidence: string;
}

export interface OperationsMetric {
  score: number; // 0 - 10
  localSourcingPct: number;
  energyEfficiency: string;
  waterUsageGrade: string;
  evidence: string;
}

export interface PlantBasedMetric {
  score: number; // 0 - 10
  plantMenuSharePct: number;
  signaturePlantDish: string;
  evidence: string;
}

export interface AccessibilityMetric {
  score: number; // 0 - 10
  stepFreeEntrance: boolean;
  accessibleBathroom: boolean;
  handicapSeating: boolean;
  evidence: string;
}

export interface RestaurantMetrics {
  wasteManagement: WasteManagementMetric;
  operations: OperationsMetric;
  plantBased: PlantBasedMetric;
  accessibility: AccessibilityMetric;
}

export interface Agent1Sources {
  googleSignal: string;
  resySignal: string;
  beliSignal: string;
}

export interface RestaurantRecord {
  id: string;
  name: string;
  neighborhood: string;
  borough: string;
  address: string;
  cuisine: string;
  priceLevel: string;
  lat: number;
  lng: number;
  imageUrl: string;
  googleRating: number;
  googleReviewCount: number;
  resyRating: number;
  beliScore: number;
  summary: string;
  buzzwords: string[];
  agent1Sources: Agent1Sources;
  metrics: RestaurantMetrics;
}

export type UserMetricWeights = Record<MetricKey, number>;

export interface ScoreThresholds {
  fireCutoff: number; // default 3.0 (below this = Fire / Really Bad)
  twoLeafCutoff: number; // default 6.0 (at or above this = 2 Leaves / Better)
  threeLeafCutoff: number; // default 8.0 (at or above this = 3 Leaves / Great)
}

export interface UserProfile {
  name: string;
  email: string;
  avatarInitials: string;
  hasCompletedOnboarding: boolean;
}

export type SustainabilityTier = "fire" | "leaf-1" | "leaf-2" | "leaf-3";

export interface ScoreEvaluation {
  weightedScore: number;
  unweightedScore: number;
  tier: SustainabilityTier;
  leafCount: 0 | 1 | 2 | 3;
  isFire: boolean;
  shortLabel: string;
  verdictTitle: string;
  verdictDetail: string;
  breakdown: {
    key: MetricKey;
    label: string;
    rawScore: number;
    weight: number;
    normalizedSharePct: number;
    weightedContribution: number;
  }[];
}
