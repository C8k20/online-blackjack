"use client";

import type { CSSProperties } from "react";
import type { RankInfo } from "@/lib/ranking";
import { rankBannerTextClasses, rankSurfaceClasses, rankUsesColorVar } from "@/lib/ranking";
import { RankBadge } from "@/components/RankBadge";

export type UserProfileData = {
  userId: string;
  username: string;
  chips: number;
  rankPoints: number;
  rank: RankInfo;
};

type UserProfilePanelProps = {
  profile: UserProfileData;
  compact?: boolean;
};

export function UserProfilePanel({ profile, compact = false }: UserProfilePanelProps) {
  const { rank } = profile;
  const progressPct = Math.round(rank.progressInStage * 100);
  const nextLabel =
    rank.nextThreshold != null
      ? `${rank.rankPoints} / ${rank.nextThreshold} RP to next stage`
      : "Maximum rank achieved";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <RankBadge rank={rank} size="md" />
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">@{profile.username}</span>
          <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
          <span>{profile.chips} chips</span>
        </div>
      </div>
    );
  }

  return (
    <section className="rank-profile-card overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className={`rank-profile-banner relative px-6 py-5 ${rankSurfaceClasses(rank)} ${rankBannerTextClasses(rank)}`}
        style={
          rankUsesColorVar(rank)
            ? ({
                "--rank-color": rank.color,
                "--rank-glow": `${rank.color}88`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className="relative z-[1] flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="rank-banner-muted text-xs font-medium uppercase tracking-[0.2em]">Player profile</p>
            <h2 className="mt-1 text-2xl font-bold drop-shadow-sm">@{profile.username}</h2>
            <p className="rank-banner-muted mt-2 text-sm font-medium">{rank.stageLabel}</p>
          </div>
          <RankBadge rank={rank} size="lg" showPoints />
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Rank progress</span>
            <span>{nextLabel}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`rank-progress-bar h-full rounded-full ${rankSurfaceClasses({ ...rank, shineLevel: Math.min(rank.shineLevel, 4) })}`}
              style={
                rankUsesColorVar(rank)
                  ? ({
                      width: `${progressPct}%`,
                      "--rank-color": rank.color,
                    } as CSSProperties)
                  : { width: `${progressPct}%` }
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Rank points</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{profile.rankPoints}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Chips</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{profile.chips}</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Wins earn ~18 RP (~30 with 21). Losses cost ~5–25 RP depending on your rank. Ties and bust-outs
          do not change rank.
        </p>
      </div>
    </section>
  );
}
