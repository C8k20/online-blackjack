/**
 * Rank display helpers — keep in sync with online-blackjack-server/src/ranking.ts.
 */

export type RankTierId =
  | "bronze"
  | "silver"
  | "gold"
  | "diamond"
  | "emerald"
  | "master"
  | "grandmaster"
  | "champion";

export type RankInfo = {
  tierId: RankTierId;
  tierName: string;
  stage: number;
  stageLabel: string;
  rankPoints: number;
  nextThreshold: number | null;
  progressInStage: number;
  color: string;
  shineLevel: number;
  isOpal: boolean;
  isOpalDetailed: boolean;
};

type TierDef = {
  id: RankTierId;
  name: string;
  stages: number[];
  color: string;
  shineLevel: number;
  isOpal: boolean;
  isOpalDetailed: boolean;
};

const TIERS: TierDef[] = [
  { id: "bronze", name: "Bronze", stages: [0, 250, 500], color: "#b87333", shineLevel: 1, isOpal: false, isOpalDetailed: false },
  { id: "silver", name: "Silver", stages: [750, 1000, 1250], color: "#c0c0c0", shineLevel: 2, isOpal: false, isOpalDetailed: false },
  { id: "gold", name: "Gold", stages: [1500, 2000, 2500], color: "#d4af37", shineLevel: 3, isOpal: false, isOpalDetailed: false },
  { id: "diamond", name: "Diamond", stages: [3000, 3750, 4500], color: "#7dd3fc", shineLevel: 4, isOpal: false, isOpalDetailed: false },
  { id: "emerald", name: "Emerald", stages: [5250, 6500, 7750], color: "#86efac", shineLevel: 5, isOpal: false, isOpalDetailed: false },
  { id: "master", name: "Master", stages: [9000, 10250, 11500], color: "#e8d5ff", shineLevel: 6, isOpal: true, isOpalDetailed: false },
  { id: "grandmaster", name: "Grandmaster", stages: [12750, 14500, 16250], color: "#d4f0ff", shineLevel: 7, isOpal: true, isOpalDetailed: true },
  { id: "champion", name: "Champion", stages: [18000], color: "#a855f7", shineLevel: 8, isOpal: false, isOpalDetailed: false },
];

const STAGE_ROMAN = ["I", "II", "III"] as const;

function flatThresholds(): { tier: TierDef; stageIndex: number; threshold: number }[] {
  const out: { tier: TierDef; stageIndex: number; threshold: number }[] = [];
  for (const tier of TIERS) {
    tier.stages.forEach((threshold, stageIndex) => {
      out.push({ tier, stageIndex, threshold });
    });
  }
  return out.sort((a, b) => a.threshold - b.threshold);
}

const FLAT = flatThresholds();

export function rankFromPoints(rankPoints: number): RankInfo {
  const rp = Math.max(0, Math.floor(rankPoints));
  let current = FLAT[0]!;
  for (const entry of FLAT) {
    if (rp >= entry.threshold) current = entry;
    else break;
  }
  const currentIdx = FLAT.indexOf(current);
  const next = FLAT[currentIdx + 1] ?? null;
  const stageNum = current.stageIndex + 1;
  const stageRoman = STAGE_ROMAN[current.stageIndex] ?? String(stageNum);
  const stageLabel =
    current.tier.id === "champion"
      ? current.tier.name
      : `${current.tier.name} ${stageRoman}`;

  let progressInStage = 1;
  if (next) {
    const span = next.threshold - current.threshold;
    progressInStage = span > 0 ? Math.min(1, (rp - current.threshold) / span) : 0;
  }

  return {
    tierId: current.tier.id,
    tierName: current.tier.name,
    stage: stageNum,
    stageLabel,
    rankPoints: rp,
    nextThreshold: next?.threshold ?? null,
    progressInStage,
    color: current.tier.color,
    shineLevel: current.tier.shineLevel,
    isOpal: current.tier.isOpal,
    isOpalDetailed: current.tier.isOpalDetailed,
  };
}

/** CSS classes for rank badge / banner surfaces. */
export function rankSurfaceClasses(rank: RankInfo): string {
  const shine = `rank-shine-${rank.shineLevel}`;
  switch (rank.tierId) {
    case "bronze":
      return `${shine} rank-metal-bronze`;
    case "silver":
      return `${shine} rank-metal-silver`;
    case "gold":
      return `${shine} rank-metal-gold`;
    case "diamond":
      return `${shine} rank-crystal-diamond`;
    case "emerald":
      return `${shine} rank-crystal-emerald`;
    case "master":
      return `${shine} rank-opal`;
    case "grandmaster":
      return `${shine} rank-opal rank-opal-detailed`;
    case "champion":
      return `${shine} rank-champion`;
    default:
      return `${shine} rank-solid`;
  }
}

/** Tiers that use --rank-color (legacy gem fallback). */
export function rankUsesColorVar(_rank: RankInfo): boolean {
  return false;
}

/** Profile banner text colors tuned per material. */
export function rankBannerTextClasses(rank: RankInfo): string {
  switch (rank.tierId) {
    case "silver":
      return "text-slate-800 [&_.rank-banner-muted]:text-slate-600";
    case "gold":
      return "text-amber-950 [&_.rank-banner-muted]:text-amber-900/75";
    case "diamond":
      return "text-sky-950 [&_.rank-banner-muted]:text-sky-800/80";
    case "emerald":
      return "text-emerald-950 [&_.rank-banner-muted]:text-emerald-800/80";
    case "master":
    case "grandmaster":
      return "text-slate-900 [&_.rank-banner-muted]:text-slate-700";
    case "champion":
      return "text-amber-50 [&_.rank-banner-muted]:text-amber-100/85";
    default:
      return "text-white [&_.rank-banner-muted]:text-white/80";
  }
}
