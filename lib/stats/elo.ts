import type { Dataset, Match } from "@/lib/types";

/**
 * Our own ELO reconstruction. The Gazette's exact formula is private, so we
 * replay every match chronologically with a standard ELO (start 1000, K=24,
 * team rating = average) purely to draw a *shape* — the player's momentum over
 * the season. Labelled in the UI as "formkurve (rekonstrueret)".
 */

const START = 1000;
const K = 24;

export interface RatingPoint {
  date: string;
  rating: number;
  matchId: number;
}

function expected(a: number, b: number): number {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

export function ratingHistory(data: Dataset): Record<number, RatingPoint[]> {
  const current: Record<number, number> = {};
  for (const p of data.players) current[p.id] = START;

  const history: Record<number, RatingPoint[]> = {};
  for (const p of data.players) {
    history[p.id] = [{ date: data.matches[0]?.date ?? p.name, rating: START, matchId: 0 }];
  }

  const avg = (ids: number[]) =>
    ids.reduce((s, id) => s + (current[id] ?? START), 0) / Math.max(ids.length, 1);

  for (const m of data.matches) {
    const ra = avg(m.teamA);
    const rb = avg(m.teamB);
    const ea = expected(ra, rb);
    const scoreA = m.winner === "A" ? 1 : 0;
    const deltaA = K * (scoreA - ea);

    for (const id of m.teamA) {
      current[id] = (current[id] ?? START) + deltaA;
      history[id]?.push({ date: m.date, rating: Math.round(current[id]), matchId: m.id });
    }
    for (const id of m.teamB) {
      current[id] = (current[id] ?? START) - deltaA;
      history[id]?.push({ date: m.date, rating: Math.round(current[id]), matchId: m.id });
    }
  }

  return history;
}

/** Biggest single-match rating swing per player (our "comeback"/"collapse"). */
export function biggestSwings(data: Dataset) {
  const hist = ratingHistory(data);
  const best: Record<number, { up: number; down: number }> = {};
  for (const [id, pts] of Object.entries(hist)) {
    let up = 0;
    let down = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = pts[i].rating - pts[i - 1].rating;
      if (d > up) up = d;
      if (d < down) down = d;
    }
    best[Number(id)] = { up, down };
  }
  return best;
}
