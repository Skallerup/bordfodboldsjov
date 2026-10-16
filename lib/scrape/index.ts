import { cache } from "react";
import type { Dataset, Player } from "@/lib/types";
import { fetchPage } from "./source";
import { parseMatches, parsePlayers } from "./parse";

/**
 * getData() is the single entry point for the whole app. It is wrapped in
 * React.cache() so a single render pass scrapes each page once; the
 * underlying fetches are ISR-cached for 30 min across requests.
 */
export const getData = cache(async (): Promise<Dataset> => {
  const [playersHtml, matchesHtml] = await Promise.all([
    fetchPage("/players"),
    fetchPage("/matches"),
  ]);

  const players = parsePlayers(playersHtml);
  const matches = parseMatches(matchesHtml)
    // oldest -> newest, so rating replay & streaks read naturally
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));

  // Make sure every player referenced by a match exists (defensive).
  const byId: Record<number, Player> = {};
  for (const p of players) byId[p.id] = p;
  for (const m of matches) {
    for (const id of [...m.teamA, ...m.teamB]) {
      if (!byId[id]) {
        const stub: Player = {
          id,
          name: `Spiller ${id}`,
          short: `#${id}`,
          matches: 0,
          wins: 0,
          rating: 1000,
          provisional: true,
        };
        byId[id] = stub;
        players.push(stub);
      }
    }
  }

  return { players, matches, byId, scrapedAt: new Date().toISOString() };
});

export function playerByShortOrId(data: Dataset, key: string): Player | undefined {
  const asId = Number(key);
  if (!Number.isNaN(asId) && data.byId[asId]) return data.byId[asId];
  const lower = decodeURIComponent(key).toLowerCase();
  return data.players.find(
    (p) => p.name.toLowerCase() === lower || p.short.toLowerCase() === lower,
  );
}

/** URL-safe slug for a player (first name, lowercased). */
export function playerSlug(p: Player): string {
  return encodeURIComponent(p.short.toLowerCase());
}
