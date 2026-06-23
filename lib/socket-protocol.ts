/**
 * Keep in sync with online-blackjack-server/src/types.ts (duplicated on purpose).
 */

import type { RankInfo } from "./ranking";

export type GamePhase = "lobby" | "playing" | "finished";

export type RankChangeSnapshot = {
  playerId: string;
  delta: number;
  rankPoints: number;
  rank: RankInfo;
};

export type PlayerSnapshot = {
  id: string;
  name: string;
  chips: number;
  bet: number;
  hand: string[];
  concealedCount: number;
  bust: boolean;
  stood: boolean;
  handValue: number | null;
  rank: RankInfo;
};

export type RoomSnapshot = {
  code: string;
  hostPlayerId: string;
  phase: GamePhase;
  players: PlayerSnapshot[];
  currentPlayerId: string | null;
  outcomeMessage: string;
  deckRemaining: number;
  rankChanges: RankChangeSnapshot[];
};
