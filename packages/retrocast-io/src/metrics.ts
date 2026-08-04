import type {
  MetricEstimate,
  ParsedCanonicalMetricKey,
  RetrocastAnalysisFile,
  RetrocastMetricStatistic,
  RetrocastTier,
  SolvMetricKey,
  TierValidityMetricKey,
} from "./types.js"

function assertTier(tier: number): asserts tier is RetrocastTier {
  if (!Number.isInteger(tier) || tier < 0 || tier > 3) {
    throw new Error(`tier must be an integer from 0 through 3, got ${tier}`)
  }
}

function assertMetricLabel(label: string): void {
  if (label.length === 0) {
    throw new Error("metric label must not be empty")
  }
}

export function tierValidityMetricKey(
  tier: number,
  statistic: RetrocastMetricStatistic = "rate"
): TierValidityMetricKey {
  assertTier(tier)
  return `tier_${tier}_validity_${statistic}`
}

export function solvMetricKey(
  tier: number,
  label: string,
  statistic: RetrocastMetricStatistic = "rate"
): SolvMetricKey {
  assertTier(tier)
  assertMetricLabel(label)
  return `solv_${tier}[${label}]_${statistic}`
}

export function parseCanonicalMetricKey(
  key: string
): ParsedCanonicalMetricKey | null {
  const tierValidity = /^tier_([0-3])_validity_(rate|mrr)$/.exec(key)
  if (tierValidity) {
    return {
      family: "tier-validity",
      tier: Number(tierValidity[1]) as RetrocastTier,
      statistic: tierValidity[2] as RetrocastMetricStatistic,
    }
  }

  const solv = /^solv_([0-3])\[(.+)]_(rate|mrr)$/.exec(key)
  if (!solv) {
    return null
  }
  return {
    family: "solv",
    tier: Number(solv[1]) as RetrocastTier,
    label: solv[2] as string,
    statistic: solv[3] as RetrocastMetricStatistic,
  }
}

export function getAnalysisMetric(
  analysis: RetrocastAnalysisFile,
  key: string,
  stratum?: string
): MetricEstimate | undefined {
  return stratum == null
    ? analysis.metrics[key]
    : analysis.by_stratum[stratum]?.[key]
}

export function getTierValidityMetric(
  analysis: RetrocastAnalysisFile,
  tier: number,
  statistic: RetrocastMetricStatistic = "rate",
  stratum?: string
): MetricEstimate | undefined {
  return getAnalysisMetric(
    analysis,
    tierValidityMetricKey(tier, statistic),
    stratum
  )
}

export function getSolvMetric(
  analysis: RetrocastAnalysisFile,
  tier: number,
  label: string,
  statistic: RetrocastMetricStatistic = "rate",
  stratum?: string
): MetricEstimate | undefined {
  return getAnalysisMetric(
    analysis,
    solvMetricKey(tier, label, statistic),
    stratum
  )
}
