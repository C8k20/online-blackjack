/**
 * Keep in sync with online-blackjack-server/src/types.ts (duplicated on purpose).
 */

export type GamePhase = "lobby" | "playing" | "finished";

export type PlayerSnapshot = {
  id: string;
  name: string;
  hand: string[];
  concealedCount: number;
  bust: boolean;
  stood: boolean;
  handValue: number | null;
};

export type RoomSnapshot = {
  code: string;
  hostPlayerId: string;
  phase: GamePhase;
  players: PlayerSnapshot[];
  currentPlayerId: string | null;
  outcomeMessage: string;
  deckRemaining: number;
};
