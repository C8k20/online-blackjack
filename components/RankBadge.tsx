"use client";

import type { CSSProperties } from "react";
import type { RankInfo } from "@/lib/ranking";
import { rankSurfaceClasses, rankUsesColorVar } from "@/lib/ranking";

type RankBadgeProps = {
  rank: RankInfo;
  size?: "sm" | "md" | "lg";
  showPoints?: boolean;
};

const SIZE = {
  sm: { wrap: "h-7 px-2.5 text-[10px]", icon: "h-4 w-4 text-[9px]", gap: "gap-1.5" },
  md: { wrap: "h-9 px-3 text-xs", icon: "h-5 w-5 text-[10px]", gap: "gap-2" },
  lg: { wrap: "h-12 px-4 text-sm", icon: "h-7 w-7 text-xs", gap: "gap-2.5" },
} as const;

function tierIcon(tierId: RankInfo["tierId"]): string {
  switch (tierId) {
    case "bronze":
      return "B";
    case "silver":
      return "S";
    case "gold":
      return "G";
    case "diamond":
      return "◆";
    case "emerald":
      return "♦";
    case "master":
      return "M";
    case "grandmaster":
      return "GM";
    case "champion":
      return "★";
    default:
      return "?";
  }
}

export function RankBadge({ rank, size = "md", showPoints = false }: RankBadgeProps) {
  const s = SIZE[size];
  const surface = rankSurfaceClasses(rank);
  const style = rankUsesColorVar(rank)
    ? ({
        "--rank-color": rank.color,
        "--rank-glow": `${rank.color}66`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`rank-badge ${surface} inline-flex items-center rounded-full border font-semibold tracking-wide ${s.wrap} ${s.gap}`}
      style={style}
      title={`${rank.stageLabel} — ${rank.rankPoints} RP`}
    >
      <span
        className={`rank-icon relative flex shrink-0 items-center justify-center rounded-full border font-bold ${s.icon}`}
        aria-hidden
      >
        {tierIcon(rank.tierId)}
      </span>
      <span className="rank-label relative z-[1] whitespace-nowrap">{rank.stageLabel}</span>
      {showPoints ? (
        <span className="relative z-[1] font-mono text-[0.85em] opacity-90">{rank.rankPoints} RP</span>
      ) : null}
    </div>
  );
}
