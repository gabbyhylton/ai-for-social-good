import {
  MetricKey,
  RestaurantMetrics,
  ScoreEvaluation,
  ScoreThresholds,
  SustainabilityTier,
  UserMetricWeights,
} from "../types/sustainability";

export const METRIC_METADATA: Record<
  MetricKey,
  {
    label: string;
    shortLabel: string;
    friendlyTitle: string;
    subtitle: string;
    factors: string[];
  }
> = {
  wasteManagement: {
    label: "Waste Management & Reduction",
    shortLabel: "Low Waste",
    friendlyTitle: "Zero-Waste & Composting",
    subtitle: "Composting, zero single-use plastics, and food rescue donations",
    factors: ["Composting", "Plastic-Free Takeout", "Food Rescue"],
  },
  operations: {
    label: "Operations & Sourcing",
    shortLabel: "Clean Ops",
    friendlyTitle: "Farm-Fresh & Clean Energy",
    subtitle: "Hudson Valley farm sourcing, induction kitchens, and water care",
    factors: ["Local Farms", "Induction Energy", "Water Care"],
  },
  plantBased: {
    label: "Plant-Based Options",
    shortLabel: "Plant-Forward",
    friendlyTitle: "Plant-Forward Menus",
    subtitle: "Creative vegetable mains, house ferments, and low-carbon dishes",
    factors: ["Plant Menu Share", "Whole-Plant Mains", "Low-Carbon"],
  },
  accessibility: {
    label: "Physical Accessibility",
    shortLabel: "Accessible",
    friendlyTitle: "Step-Free & Accessible",
    subtitle: "Step-free street entry, ADA-compliant restroom, and spacious seating",
    factors: ["Step-Free Entry", "ADA Bathroom", "Spacious Seating"],
  },
};

export const DEFAULT_WEIGHTS: UserMetricWeights = {
  wasteManagement: 1,
  operations: 1,
  plantBased: 1,
  accessibility: 1,
};

// Fixed Standard Thresholds for fair baseline comparison across all restaurants
export const STANDARD_THRESHOLDS: ScoreThresholds = {
  fireCutoff: 3.0,
  twoLeafCutoff: 6.0,
  threeLeafCutoff: 8.0,
};

export function evaluateSustainabilityScore(
  metrics: RestaurantMetrics,
  weights: UserMetricWeights
): ScoreEvaluation {
  const keys: MetricKey[] = [
    "wasteManagement",
    "operations",
    "plantBased",
    "accessibility",
  ];

  const totalWeight = keys.reduce(
    (acc, key) => acc + Math.max(0.5, weights[key] || 1),
    0
  );

  let weightedSum = 0;
  let unweightedSum = 0;

  const breakdown = keys.map((key) => {
    const rawScore = metrics[key].score;
    const weight = Math.max(0.5, weights[key] || 1);
    const normalizedSharePct = Math.round((weight / totalWeight) * 100);
    const weightedContribution = (rawScore * weight) / totalWeight;

    weightedSum += weightedContribution;
    unweightedSum += rawScore;

    return {
      key,
      label: METRIC_METADATA[key].label,
      rawScore,
      weight,
      normalizedSharePct,
      weightedContribution: Number(weightedContribution.toFixed(2)),
    };
  });

  const weightedScore = Number(weightedSum.toFixed(1));
  const unweightedScore = Number((unweightedSum / 4).toFixed(1));

  let tier: SustainabilityTier = "leaf-1";
  let leafCount: 0 | 1 | 2 | 3 = 1;
  let isFire = false;

  if (weightedScore < STANDARD_THRESHOLDS.fireCutoff) {
    tier = "fire";
    leafCount = 0;
    isFire = true;
  } else if (weightedScore >= STANDARD_THRESHOLDS.threeLeafCutoff) {
    tier = "leaf-3";
    leafCount = 3;
    isFire = false;
  } else if (weightedScore >= STANDARD_THRESHOLDS.twoLeafCutoff) {
    tier = "leaf-2";
    leafCount = 2;
    isFire = false;
  }

  return {
    weightedScore,
    unweightedScore,
    tier,
    leafCount,
    isFire,
    shortLabel: "",
    verdictTitle: "",
    verdictDetail: "",
    breakdown,
  };
}

/**
 * Evaluates both the locked Standard Baseline Score (equal weights)
 * and the user's customized Personal Score.
 */
export function evaluateDualScores(
  metrics: RestaurantMetrics,
  personalWeights: UserMetricWeights
): {
  standard: ScoreEvaluation;
  personal: ScoreEvaluation;
} {
  return {
    standard: evaluateSustainabilityScore(metrics, DEFAULT_WEIGHTS),
    personal: evaluateSustainabilityScore(metrics, personalWeights),
  };
}
