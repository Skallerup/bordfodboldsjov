import Link from "next/link";
import type { Dataset, Match } from "@/lib/types";
import { formatDateShort, side } from "@/lib/stats/derive";
import { playerSlug } from "@/lib/scrape";

function Team({ data, ids, win, align }: { data: Dataset; ids: number[]; win: boolean; align: "right" | "left" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {ids.map((id, i) => {
        const p = data.byId[id];
        return (
          <span key={id} className="flex items-center gap-1">
            {i > 0 && <span className="text-ink-soft">&amp;</span>}
            <Link
              href={`/spillere/${playerSlug(p)}`}
              className={`relative z-20 hover:text-grape ${win ? "font-extrabold" : "text-ink-soft"}`}
            >
              {p?.short ?? `#${id}`}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

export function MatchRow({ data, match, highlightId }: { data: Dataset; match: Match; highlightId?: number }) {
  const mine = highlightId ? side(match, highlightId) : null;
  return (
    <li className="relative grid grid-cols-12 items-center gap-2 border-b-2 border-ink/10 px-2 py-3 last:border-b-0 hover:bg-cream">
      <div className="col-span-3 flex flex-col sm:col-span-2">
        <span className="chip w-fit bg-paper px-2 py-0.5 text-[10px]">{match.mode}</span>
        <span className="mt-0.5 text-[11px] text-ink-soft">{formatDateShort(match.date)}</span>
      </div>
      <div className="col-span-4 text-right">
        <Team data={data} ids={match.teamA} win={match.winner === "A"} align="right" />
      </div>
      <div className="col-span-2 text-center">
        <span className="font-display text-xl font-extrabold">
          <span className={match.winner === "A" ? "" : "text-ink-soft"}>{match.scoreA}</span>
          <span className="mx-1 text-ink-soft">–</span>
          <span className={match.winner === "B" ? "" : "text-ink-soft"}>{match.scoreB}</span>
        </span>
        {match.egg && <span className="ml-1" title="Æg!">🥚</span>}
      </div>
      <div className="col-span-3 sm:col-span-4">
        <Team data={data} ids={match.teamB} win={match.winner === "B"} align="left" />
      </div>
      {mine && (
        <span
          className={`absolute left-0 top-0 h-full w-1.5 ${
            (mine === "A" && match.winner === "A") || (mine === "B" && match.winner === "B")
              ? "bg-lime"
              : "bg-tomato"
          }`}
        />
      )}
    </li>
  );
}
