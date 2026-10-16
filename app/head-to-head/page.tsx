import { getData, playerByShortOrId, playerSlug } from "@/lib/scrape";
import { headToHead, pct } from "@/lib/stats/derive";
import { moodFromForm } from "@/lib/face/seed";
import { PlayerFace } from "@/components/PlayerFace";
import { MatchRow } from "@/components/MatchRow";
import { H2HPicker } from "@/components/H2HPicker";
import { SectionTitle } from "@/components/ui";
import { allPlayerStats } from "@/lib/stats/derive";

export const revalidate = 1800;

export const metadata = { title: "Head-to-head — Bordfodbold SJOV" };

export default async function H2HPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a: aParam, b: bParam } = await searchParams;
  const data = await getData();
  const stats = allPlayerStats(data);
  const ranked = [...data.players].sort((x, y) => y.rating - x.rating);

  const a = (aParam && playerByShortOrId(data, aParam)) || ranked[0];
  const b =
    (bParam && playerByShortOrId(data, bParam)) ||
    ranked.find((p) => p.id !== a.id) ||
    ranked[1];

  const h = headToHead(data, a.id, b.id);
  const options = ranked.map((p) => ({ slug: playerSlug(p), name: p.name }));
  const aLeads = h.winsA > h.winsB;
  const bLeads = h.winsB > h.winsA;
  const totalW = h.winsA + h.winsB || 1;

  const moodA = moodFromForm({ currentStreak: stats[a.id].current, winRate: aLeads ? 0.7 : 0.4 });
  const moodB = moodFromForm({ currentStreak: stats[b.id].current, winRate: bLeads ? 0.7 : 0.4 });

  return (
    <div className="space-y-8">
      <SectionTitle emoji="⚔️" title="Head-to-head" sub="Vælg to krigere og se det blodige regnskab" />

      <div className="card-pop p-5">
        <H2HPicker options={options} a={playerSlug(a)} b={playerSlug(b)} />
      </div>

      {h.games === 0 ? (
        <p className="card-pop p-8 text-center font-display text-xl font-extrabold">
          {a.short} og {b.short} har aldrig mødt hinanden på hver sin side af bordet. 🤝
        </p>
      ) : (
        <>
          {/* SCOREBOARD */}
          <div className="card-pop grid grid-cols-3 items-center gap-2 p-6">
            <div className="flex flex-col items-center">
              <PlayerFace seed={a.name} mood={moodA} size={120} />
              <p className="mt-2 font-display text-xl font-extrabold">{a.short}</p>
              {aLeads && <span className="chip bg-lime">fører 👑</span>}
            </div>
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold">
                <span className={aLeads ? "text-lime" : ""}>{h.winsA}</span>
                <span className="text-ink-soft">–</span>
                <span className={bLeads ? "text-lime" : ""}>{h.winsB}</span>
              </p>
              <p className="text-sm font-bold text-ink-soft">{h.games} kampe</p>
              <p className="mt-1 text-xs font-semibold text-ink-soft">
                ⚽ {h.goalsA}–{h.goalsB} mål
              </p>
            </div>
            <div className="flex flex-col items-center">
              <PlayerFace seed={b.name} mood={moodB} size={120} />
              <p className="mt-2 font-display text-xl font-extrabold">{b.short}</p>
              {bLeads && <span className="chip bg-lime">fører 👑</span>}
            </div>
          </div>

          {/* WIN SHARE BAR */}
          <div className="flex h-8 overflow-hidden rounded-full border-[3px] border-ink">
            <div className="flex items-center justify-start bg-grape px-3 font-bold text-white" style={{ width: `${(h.winsA / totalW) * 100}%` }}>
              {pct(h.winsA / totalW)}
            </div>
            <div className="flex items-center justify-end bg-bubble px-3 font-bold text-ink" style={{ width: `${(h.winsB / totalW) * 100}%` }}>
              {pct(h.winsB / totalW)}
            </div>
          </div>

          {/* MATCH LIST */}
          <div>
            <h2 className="heading-xl mb-3 text-xl">📜 Alle opgør</h2>
            <ul className="card-pop overflow-hidden p-0">
              {[...h.matches].reverse().map((m) => (
                <MatchRow key={m.id} data={data} match={m} highlightId={a.id} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
