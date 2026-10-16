/**
 * Sanity-check the scraper against live data:
 *   npm run dump
 * Prints parsed players + a few derived numbers to cross-check against the
 * Gazette (Martin 1325, 256 matches, ~3996 goals).
 */
import { fetchPage } from "../lib/scrape/source";
import { parseMatches, parsePlayers } from "../lib/scrape/parse";

async function main() {
  const [playersHtml, matchesHtml] = await Promise.all([
    fetchPage("/players"),
    fetchPage("/matches"),
  ]);
  const players = parsePlayers(playersHtml);
  const matches = parseMatches(matchesHtml);

  console.log("PLAYERS:", players.length);
  for (const p of players) {
    console.log(
      `  #${p.id} ${p.name.padEnd(18)} rating ${p.rating}  ${p.wins}/${p.matches}` +
        (p.provisional ? "  ⚠" : ""),
    );
  }

  const goals = matches.reduce((s, m) => s + m.scoreA + m.scoreB, 0);
  const modes = matches.reduce<Record<string, number>>((acc, m) => {
    acc[m.mode] = (acc[m.mode] || 0) + 1;
    return acc;
  }, {});
  const eggs = matches.filter((m) => m.egg).length;

  console.log("\nMATCHES:", matches.length);
  console.log("  goals total:", goals);
  console.log("  modes:", modes);
  console.log("  eggs:", eggs);
  console.log("  first:", matches[0]?.date, "last:", matches[matches.length - 1]?.date);
  console.log("  sample:", JSON.stringify(matches.slice(0, 2), null, 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
