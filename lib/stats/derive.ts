import type { Dataset, Match, Mode, Player } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

export function side(m: Match, id: number): "A" | "B" | null {
  if (m.teamA.includes(id)) return "A";
  if (m.teamB.includes(id)) return "B";
  return null;
}

export function won(m: Match, id: number): boolean {
  const s = side(m, id);
  return s !== null && m.winner === s;
}

export function goalsFor(m: Match, id: number): number {
  return side(m, id) === "A" ? m.scoreA : m.scoreB;
}
export function goalsAgainst(m: Match, id: number): number {
  return side(m, id) === "A" ? m.scoreB : m.scoreA;
}

export function playerMatches(data: Dataset, id: number): Match[] {
  return data.matches.filter((m) => side(m, id) !== null);
}

export const WEEKDAYS = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

/* ------------------------------------------------------------------ *
 * Per-player stats
 * ------------------------------------------------------------------ */

export interface Streak {
  type: "W" | "L";
  length: number;
}

export interface PlayerStats {
  id: number;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  goalsPerGame: number;
  concededPerGame: number;
  longestWinStreak: number;
  longestLossStreak: number;
  current: Streak;
  /** Chronological W/L of the most recent 12 games (oldest -> newest). */
  form: ("W" | "L")[];
  biggestWin?: { margin: number; match: Match };
  biggestLoss?: { margin: number; match: Match };
  eggsServed: number; // opponents shut out in your wins
  eggsReceived: number; // you were shut out
  byMode: Record<Mode, { games: number; wins: number }>;
  bestWeekday?: { day: string; winRate: number; games: number };
}

export function computePlayerStats(data: Dataset, id: number): PlayerStats {
  const ms = playerMatches(data, id); // already oldest -> newest
  const byMode: Record<Mode, { games: number; wins: number }> = {
    "1v1": { games: 0, wins: 0 },
    "1v2": { games: 0, wins: 0 },
    "2v2": { games: 0, wins: 0 },
  };
  const weekday: Record<number, { games: number; wins: number }> = {};

  let wins = 0;
  let gf = 0;
  let ga = 0;
  let longestW = 0;
  let longestL = 0;
  let runW = 0;
  let runL = 0;
  let eggsServed = 0;
  let eggsReceived = 0;
  let biggestWin: PlayerStats["biggestWin"];
  let biggestLoss: PlayerStats["biggestLoss"];
  const form: ("W" | "L")[] = [];

  for (const m of ms) {
    const w = won(m, id);
    const f = goalsFor(m, id);
    const a = goalsAgainst(m, id);
    gf += f;
    ga += a;
    byMode[m.mode].games++;
    const wd = new Date(m.date).getDay();
    weekday[wd] = weekday[wd] || { games: 0, wins: 0 };
    weekday[wd].games++;
    form.push(w ? "W" : "L");

    if (w) {
      wins++;
      byMode[m.mode].wins++;
      weekday[wd].wins++;
      runW++;
      runL = 0;
      if (runW > longestW) longestW = runW;
      if (a === 0) eggsServed++;
      const margin = f - a;
      if (!biggestWin || margin > biggestWin.margin) biggestWin = { margin, match: m };
    } else {
      runL++;
      runW = 0;
      if (runL > longestL) longestL = runL;
      if (f === 0) eggsReceived++;
      const margin = a - f;
      if (!biggestLoss || margin > biggestLoss.margin) biggestLoss = { margin, match: m };
    }
  }

  const games = ms.length;
  const last = ms[ms.length - 1];
  const current: Streak = { type: last ? (won(last, id) ? "W" : "L") : "W", length: 0 };
  for (let i = ms.length - 1; i >= 0; i--) {
    if ((won(ms[i], id) ? "W" : "L") === current.type) current.length++;
    else break;
  }

  let bestWeekday: PlayerStats["bestWeekday"];
  for (const [wd, v] of Object.entries(weekday)) {
    if (v.games < 3) continue;
    const wr = v.wins / v.games;
    if (!bestWeekday || wr > bestWeekday.winRate) {
      bestWeekday = { day: WEEKDAYS[Number(wd)], winRate: wr, games: v.games };
    }
  }

  return {
    id,
    games,
    wins,
    losses: games - wins,
    winRate: games ? wins / games : 0,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDiff: gf - ga,
    goalsPerGame: games ? gf / games : 0,
    concededPerGame: games ? ga / games : 0,
    longestWinStreak: longestW,
    longestLossStreak: longestL,
    current,
    form: form.slice(-12),
    biggestWin,
    biggestLoss,
    eggsServed,
    eggsReceived,
    byMode,
    bestWeekday,
  };
}

export function allPlayerStats(data: Dataset): Record<number, PlayerStats> {
  const out: Record<number, PlayerStats> = {};
  for (const p of data.players) out[p.id] = computePlayerStats(data, p.id);
  return out;
}

/* ------------------------------------------------------------------ *
 * Head-to-head
 * ------------------------------------------------------------------ */

export interface H2H {
  games: number;
  winsA: number;
  winsB: number;
  goalsA: number;
  goalsB: number;
  matches: Match[];
}

/** Matches where a and b are on OPPOSITE sides (any mode). */
export function headToHead(data: Dataset, a: number, b: number): H2H {
  const res: H2H = { games: 0, winsA: 0, winsB: 0, goalsA: 0, goalsB: 0, matches: [] };
  for (const m of data.matches) {
    const sa = side(m, a);
    const sb = side(m, b);
    if (!sa || !sb || sa === sb) continue;
    res.games++;
    res.matches.push(m);
    res.goalsA += goalsFor(m, a);
    res.goalsB += goalsFor(m, b);
    if (won(m, a)) res.winsA++;
    else res.winsB++;
  }
  return res;
}

export interface Rivalry {
  a: Player;
  b: Player;
  games: number;
  winsA: number;
  winsB: number;
}

/** Most-played opposing pairs, sorted by number of games. */
export function topRivalries(data: Dataset, limit = 6): Rivalry[] {
  const key = (x: number, y: number) => `${Math.min(x, y)}-${Math.max(x, y)}`;
  const map = new Map<string, { a: number; b: number; games: number; winsA: number; winsB: number }>();
  for (const m of data.matches) {
    for (const x of m.teamA) {
      for (const y of m.teamB) {
        const k = key(x, y);
        const lo = Math.min(x, y);
        let e = map.get(k);
        if (!e) {
          e = { a: lo, b: Math.max(x, y), games: 0, winsA: 0, winsB: 0 };
          map.set(k, e);
        }
        e.games++;
        const aWon = won(m, e.a);
        if (aWon) e.winsA++;
        else e.winsB++;
      }
    }
  }
  return [...map.values()]
    .sort((p, q) => q.games - p.games)
    .slice(0, limit)
    .map((e) => ({
      a: data.byId[e.a],
      b: data.byId[e.b],
      games: e.games,
      winsA: e.winsA,
      winsB: e.winsB,
    }));
}

/* ------------------------------------------------------------------ *
 * Global / fun records
 * ------------------------------------------------------------------ */

export interface GlobalStats {
  totalMatches: number;
  totalGoals: number;
  goalsPerMatch: number;
  modeBreakdown: Record<Mode, number>;
  busiestDay: { date: string; count: number };
  biggestMargin: Match;
  mostGoals: Match;
  closest: Match;
  activityByMonth: { month: string; count: number }[];
}

export function globalStats(data: Dataset): GlobalStats {
  const ms = data.matches;
  const totalGoals = ms.reduce((s, m) => s + m.scoreA + m.scoreB, 0);
  const modeBreakdown = ms.reduce(
    (acc, m) => {
      acc[m.mode]++;
      return acc;
    },
    { "1v1": 0, "1v2": 0, "2v2": 0 } as Record<Mode, number>,
  );

  const byDay = new Map<string, number>();
  const byMonth = new Map<string, number>();
  for (const m of ms) {
    const day = m.date.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
    const month = m.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) || 0) + 1);
  }
  const busiest = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];

  let biggestMargin = ms[0];
  let mostGoals = ms[0];
  let closest = ms[0];
  for (const m of ms) {
    const margin = Math.abs(m.scoreA - m.scoreB);
    const total = m.scoreA + m.scoreB;
    if (margin > Math.abs(biggestMargin.scoreA - biggestMargin.scoreB)) biggestMargin = m;
    if (total > mostGoals.scoreA + mostGoals.scoreB) mostGoals = m;
    const cm = Math.abs(closest.scoreA - closest.scoreB);
    if (margin < cm || (margin === cm && total > closest.scoreA + closest.scoreB)) closest = m;
  }

  const activityByMonth = [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, count]) => ({ month, count }));

  return {
    totalMatches: ms.length,
    totalGoals,
    goalsPerMatch: ms.length ? totalGoals / ms.length : 0,
    modeBreakdown,
    busiestDay: { date: busiest[0], count: busiest[1] },
    biggestMargin,
    mostGoals,
    closest,
    activityByMonth,
  };
}

/* ------------------------------------------------------------------ *
 * Formatting helpers used across the UI
 * ------------------------------------------------------------------ */

const DK_MONTHS = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${DK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${DK_MONTHS[d.getMonth()].slice(0, 3)}.`;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
