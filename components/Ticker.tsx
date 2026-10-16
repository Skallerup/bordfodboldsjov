import type { Dataset, Match } from "@/lib/types";

function names(data: Dataset, ids: number[]) {
  return ids.map((id) => data.byId[id]?.short ?? `#${id}`).join(" & ");
}

export function Ticker({ data }: { data: Dataset }) {
  const recent = [...data.matches].slice(-16).reverse();
  const items = [...recent, ...recent]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-y-[3px] border-ink bg-ink text-cream">
      <div className="flex">
        <span className="z-10 shrink-0 border-r-[3px] border-ink bg-tomato px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white">
          ★ Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 py-2 pl-8">
            {items.map((m: Match, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm">
                <span className="rounded bg-mustard px-1.5 text-[10px] font-bold text-ink">{m.mode}</span>
                <span className={m.winner === "A" ? "font-extrabold" : "opacity-70"}>{names(data, m.teamA)}</span>
                <span className="font-display text-base font-extrabold">
                  {m.scoreA}–{m.scoreB}
                </span>
                <span className={m.winner === "B" ? "font-extrabold" : "opacity-70"}>{names(data, m.teamB)}</span>
                {m.egg && <span title="Æg!">🥚</span>}
                <span className="text-cream/40">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
