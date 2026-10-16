import type { Dataset } from "@/lib/types";
import { allPlayerStats, globalStats, type PlayerStats } from "./derive";
import { biggestSwings } from "./elo";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  /** Tailwind bg color class for the medallion. */
  color: string;
  tagline: string;
  /** Short description of what it takes to earn it. */
  criteria: string;
}

export interface Award {
  badge: Badge;
  winnerId: number;
  /** Human-readable value, e.g. "10 mål" or "31 i streg". */
  detail: string;
}

interface Ctx {
  data: Dataset;
  stats: Record<number, PlayerStats>;
  swings: Record<number, { up: number; down: number }>;
}

type Pick = { id: number; detail: string } | null;

function argmax(
  ctx: Ctx,
  value: (s: PlayerStats) => number | null,
  fmt: (s: PlayerStats, v: number) => string,
  minGames = 1,
): Pick {
  let best: { id: number; v: number; s: PlayerStats } | null = null;
  for (const p of ctx.data.players) {
    const s = ctx.stats[p.id];
    if (!s || s.games < minGames) continue;
    const v = value(s);
    if (v === null) continue;
    if (!best || v > best.v) best = { id: p.id, v, s };
  }
  return best ? { id: best.id, detail: fmt(best.s, best.v) } : null;
}

export const BADGES: (Badge & { pick: (ctx: Ctx) => Pick })[] = [
  {
    id: "slagteren",
    name: "Slagteren",
    emoji: "🔪",
    color: "bg-tomato",
    tagline: "Største øretæve i én kamp",
    criteria: "Størst sejrsmargin i en enkelt kamp",
    pick: (ctx) =>
      argmax(
        ctx,
        (s) => s.biggestWin?.margin ?? null,
        (s) => `${s.biggestWin!.match.scoreA}–${s.biggestWin!.match.scoreB} (${s.biggestWin!.margin} i difference)`,
      ),
  },
  {
    id: "maalkongen",
    name: "Målkongen",
    emoji: "👑",
    color: "bg-mustard",
    tagline: "Flest mål scoret i alt",
    criteria: "Flest mål scoret gennem sæsonen",
    pick: (ctx) => argmax(ctx, (s) => s.goalsFor, (s) => `${s.goalsFor} mål`),
  },
  {
    id: "maalfesten",
    name: "Målfesten",
    emoji: "🎉",
    color: "bg-bubble",
    tagline: "Flest mål pr. kamp",
    criteria: "Bedste mål-pr-kamp (min. 5 kampe)",
    pick: (ctx) =>
      argmax(ctx, (s) => s.goalsPerGame, (s) => `${s.goalsPerGame.toFixed(1)} mål/kamp`, 5),
  },
  {
    id: "jernmuren",
    name: "Jernmuren",
    emoji: "🧱",
    color: "bg-sky",
    tagline: "Lukker færrest mål ind",
    criteria: "Færrest indkasserede pr. kamp (min. 5 kampe)",
    pick: (ctx) =>
      argmax(ctx, (s) => -s.concededPerGame, (s) => `${s.concededPerGame.toFixed(1)} indkasseret/kamp`, 5),
  },
  {
    id: "kometen",
    name: "Kometen",
    emoji: "☄️",
    color: "bg-grape",
    tagline: "Længste sejrsstime",
    criteria: "Flest sejre i træk",
    pick: (ctx) =>
      argmax(ctx, (s) => s.longestWinStreak, (s) => `${s.longestWinStreak} sejre i streg`, 1),
  },
  {
    id: "aeggebageren",
    name: "Æggebageren",
    emoji: "🥚",
    color: "bg-lime",
    tagline: "Serverer flest æg (0-kampe)",
    criteria: "Flest gange modstanderen blev holdt på nul",
    pick: (ctx) => argmax(ctx, (s) => s.eggsServed, (s) => `${s.eggsServed} æg serveret`),
  },
  {
    id: "pengeautomaten",
    name: "Pengeautomaten",
    emoji: "🎰",
    color: "bg-mint",
    tagline: "Møder altid op — flest kampe",
    criteria: "Flest spillede kampe",
    pick: (ctx) => argmax(ctx, (s) => s.games, (s) => `${s.games} kampe`),
  },
  {
    id: "comeback",
    name: "Comeback Kid",
    emoji: "📈",
    color: "bg-lime",
    tagline: "Største rating-hop i én kamp",
    criteria: "Størst positivt rating-spring (rekonstrueret)",
    pick: (ctx) => {
      let best: { id: number; v: number } | null = null;
      for (const p of ctx.data.players) {
        const up = ctx.swings[p.id]?.up ?? 0;
        if (!best || up > best.v) best = { id: p.id, v: up };
      }
      return best && best.v > 0 ? { id: best.id, detail: `+${best.v.toFixed(1)} i én kamp` } : null;
    },
  },
  {
    id: "ugedagens-helt",
    name: "Ugedagens Helt",
    emoji: "🦸",
    color: "bg-mustard",
    tagline: "Hersker på én ugedag",
    criteria: "Bedste win-rate på en bestemt ugedag (min. 3 kampe)",
    pick: (ctx) =>
      argmax(
        ctx,
        (s) => s.bestWeekday?.winRate ?? null,
        (s) => `${Math.round(s.bestWeekday!.winRate * 100)}% om ${s.bestWeekday!.day.toLowerCase()}dagen`,
      ),
  },
  {
    id: "choker",
    name: "Choker-prisen",
    emoji: "😰",
    color: "bg-ink-soft",
    tagline: "Længste nederlagsstime",
    criteria: "Flest nederlag i træk (den tvivlsomme ære)",
    pick: (ctx) =>
      argmax(ctx, (s) => s.longestLossStreak, (s) => `${s.longestLossStreak} nederlag i streg`, 1),
  },
  {
    id: "traeskeen",
    name: "Træskeen",
    emoji: "🥄",
    color: "bg-ink-soft",
    tagline: "Fik flest æg i hovedet",
    criteria: "Flest gange holdt på nul mål",
    pick: (ctx) => argmax(ctx, (s) => s.eggsReceived, (s) => `${s.eggsReceived} æg modtaget`),
  },
  {
    id: "solo-helten",
    name: "Solo-helten",
    emoji: "🦾",
    color: "bg-sky",
    tagline: "Bedst alene mod to (1v2)",
    criteria: "Flest 1v2-sejre som enlig kriger",
    pick: (ctx) =>
      argmax(
        ctx,
        (s) => (s.byMode["1v2"].games >= 3 ? s.byMode["1v2"].wins : null),
        (s) => `${s.byMode["1v2"].wins} solo-sejre`,
      ),
  },
];

export function computeAwards(data: Dataset): Award[] {
  const ctx: Ctx = {
    data,
    stats: allPlayerStats(data),
    swings: biggestSwings(data),
  };
  const awards: Award[] = [];
  for (const b of BADGES) {
    const pick = b.pick(ctx);
    if (pick) {
      const { pick: _omit, ...badge } = b;
      awards.push({ badge, winnerId: pick.id, detail: pick.detail });
    }
  }
  return awards;
}

export function awardsForPlayer(awards: Award[], id: number): Award[] {
  return awards.filter((a) => a.winnerId === id);
}

// Re-export so pages can pull global stats from one module if they like.
export { globalStats };
