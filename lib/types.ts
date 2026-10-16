export type Mode = "1v1" | "1v2" | "2v2";

export interface Player {
  id: number;
  name: string;
  /** First name / short handle used for faces and tight layouts. */
  short: string;
  matches: number;
  wins: number;
  rating: number;
  /** True when the source flags the rating as provisional (⚠, too few matches). */
  provisional: boolean;
}

export interface Match {
  id: number;
  /** ISO datetime (year inferred, see parse.ts). */
  date: string;
  mode: Mode;
  /** Player ids on each side. */
  teamA: number[];
  teamB: number[];
  scoreA: number;
  scoreB: number;
  /** "A" | "B" — derived from the score. */
  winner: "A" | "B";
  /** True when the losing side was shut out (0 goals) — an "æg". */
  egg: boolean;
}

export interface Dataset {
  players: Player[];
  matches: Match[];
  /** Map of player id -> player for quick lookups. */
  byId: Record<number, Player>;
  scrapedAt: string;
}
