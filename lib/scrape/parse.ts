import * as cheerio from "cheerio";
import type { Match, Mode, Player } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Danish month handling. The match archive prints dates WITHOUT a
 * year (e.g. "16. okt., 08.27"), so we infer the year while walking
 * the list (which is ordered newest -> oldest).
 * ------------------------------------------------------------------ */

const MONTHS: Record<string, number> = {
  jan: 0, januar: 0,
  feb: 1, februar: 1,
  mar: 2, marts: 2,
  apr: 3, april: 3,
  maj: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function monthIndex(token: string): number {
  const key = token.toLowerCase().replace(/\./g, "").trim();
  return MONTHS[key] ?? MONTHS[key.slice(0, 3)] ?? 0;
}

/** Pull the reference "den 16. oktober 2026" date from the page header. */
function referenceYearMonth(html: string): { year: number; month: number } {
  const m = html.match(/den\s+\d{1,2}\.\s+([a-zæøå]+)\s+(\d{4})/i);
  if (m) return { month: monthIndex(m[1]), year: Number(m[2]) };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ *
 * Players  (/players)
 * ------------------------------------------------------------------ */

export function parsePlayers(html: string): Player[] {
  const $ = cheerio.load(html);
  const players: Player[] = [];

  $("li.row-stripe").each((_, li) => {
    const $li = $(li);
    const link = $li.find('a[href^="/players/"]').first();
    const href = link.attr("href") || "";
    const idMatch = href.match(/\/players\/(\d+)/);
    const recordText = $li.text();
    // Only roster rows carry the "X kampe · Y sejre" summary.
    const rec = recordText.match(/(\d+)\s*kampe\s*·\s*(\d+)\s*sejre/i);
    if (!idMatch || !rec) return;

    const id = Number(idMatch[1]);
    const name = link.text().trim();
    const matches = Number(rec[1]);
    const wins = Number(rec[2]);

    // Rating sits in the right-hand column; may include a ⚠ warning.
    const ratingText = $li.find(".text-right").text();
    const ratingNum = ratingText.match(/(\d{2,5})/);
    const rating = ratingNum ? Number(ratingNum[1]) : 1000;
    const provisional = /⚠/.test($li.text());

    players.push({
      id,
      name,
      short: name.split(/\s+/)[0],
      matches,
      wins,
      rating,
      provisional,
    });
  });

  return players;
}

/* ------------------------------------------------------------------ *
 * Matches  (/matches)
 * ------------------------------------------------------------------ */

const DATE_RE = /(\d{1,2})\.\s*([a-zæøå]+)\.?,\s*(\d{1,2})\.(\d{2})/i;

export function parseMatches(html: string): Match[] {
  const $ = cheerio.load(html);
  const ref = referenceYearMonth(html);

  type Raw = Omit<Match, "date"> & { day: number; month: number; hh: number; mm: number };
  const raws: Raw[] = [];

  $("li.row-stripe").each((_, li) => {
    const $li = $(li);
    const idMatch = ($li.find("a[aria-label^='Se kamp']").attr("aria-label") || "")
      .match(/#(\d+)/) || ($li.find('a[href^="/matches/"]').attr("href") || "").match(/\/matches\/(\d+)/);
    if (!idMatch) return;
    const id = Number(idMatch[1]);

    const mode = ($li.find(".kicker").first().text().trim() as Mode);
    if (!["1v1", "1v2", "2v2"].includes(mode)) return;

    const dateText = $li
      .find("span")
      .filter((_, s) => DATE_RE.test($(s).text()))
      .first()
      .text();
    const d = dateText.match(DATE_RE);
    if (!d) return;

    const egg = $li.find("[title*='æg']").length > 0 || /ÆG/.test($li.text());

    // Columns: text-right = team A, text-left = team B.
    const teamA = $li
      .find(".text-right a[href^='/players/']")
      .map((_, a) => Number(($(a).attr("href") || "").match(/\/players\/(\d+)/)?.[1]))
      .get()
      .filter(Boolean);
    const teamB = $li
      .find(".text-left a[href^='/players/']")
      .map((_, a) => Number(($(a).attr("href") || "").match(/\/players\/(\d+)/)?.[1]))
      .get()
      .filter(Boolean);

    const scoreSpans = $li
      .find(".score-num span")
      .map((_, s) => $(s).text().trim())
      .get()
      .filter((t) => /^\d+$/.test(t));
    if (scoreSpans.length < 2 || teamA.length === 0 || teamB.length === 0) return;

    const scoreA = Number(scoreSpans[0]);
    const scoreB = Number(scoreSpans[scoreSpans.length - 1]);

    raws.push({
      id,
      mode,
      teamA,
      teamB,
      scoreA,
      scoreB,
      winner: scoreA >= scoreB ? "A" : "B",
      egg,
      day: Number(d[1]),
      month: monthIndex(d[2]),
      hh: Number(d[3]),
      mm: Number(d[4]),
    });
  });

  // Infer years. List is newest -> oldest; when the month jumps UP as we go
  // back in time we have crossed a new-year boundary.
  let year = ref.year;
  let prevMonth = ref.month;
  const matches: Match[] = raws.map((r) => {
    if (r.month > prevMonth) year -= 1;
    prevMonth = r.month;
    const date = `${year}-${pad(r.month + 1)}-${pad(r.day)}T${pad(r.hh)}:${pad(r.mm)}:00`;
    const { day, month, hh, mm, ...rest } = r;
    return { ...rest, date };
  });

  return matches;
}
