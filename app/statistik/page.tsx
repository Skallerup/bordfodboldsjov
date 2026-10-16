import Link from "next/link";
import { getData, playerSlug } from "@/lib/scrape";
import { allPlayerStats, globalStats, formatDate, pct, type PlayerStats } from "@/lib/stats/derive";
import { PlayerFace } from "@/components/PlayerFace";
import { MatchRow } from "@/components/MatchRow";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { SectionTitle, StatTile } from "@/components/ui";
import type { Dataset } from "@/lib/types";

export const revalidate = 1800;

export const metadata = { title: "Statistik — Bordfodbold SJOV" };

const MODE_COLOR: Record<string, string> = { "1v1": "bg-grape", "1v2": "bg-bubble", "2v2": "bg-sky" };

function MiniBoard({
  data,
  stats,
  title,
  emoji,
  value,
  format,
}: {
  data: Dataset;
  stats: Record<number, PlayerStats>;
  title: string;
  emoji: string;
  value: (s: PlayerStats) => number;
  format: (s: PlayerStats) => string;
}) {
  const ranked = [...data.players]
    .filter((p) => stats[p.id].games > 0)
    .sort((a, b) => value(stats[b.id]) - value(stats[a.id]))
    .slice(0, 5);
  return (
    <div className="card-pop p-4">
      <p className="mb-2 font-display text-lg font-extrabold">
        {emoji} {title}
      </p>
      <ol className="space-y-1">
        {ranked.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="w-5 text-right font-display font-extrabold text-ink-soft">{i + 1}</span>
            <PlayerFace seed={p.name} size={28} still />
            <Link href={`/spillere/${playerSlug(p)}`} className="flex-1 truncate font-bold hover:text-grape">
              {p.short}
            </Link>
            <span className="font-display font-extrabold">{format(stats[p.id])}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function StatistikPage() {
  const data = await getData();
  const stats = allPlayerStats(data);
  const g = globalStats(data);
  const total = g.totalMatches;

  return (
    <div className="space-y-12">
      <SectionTitle emoji="📊" title="Statistik-laboratoriet" sub="Grav dig ned i tallene" />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile emoji="📜" label="Kampe i alt" value={total} color="bg-mustard" />
        <StatTile emoji="⚽" label="Mål i alt" value={g.totalGoals.toLocaleString("da-DK")} color="bg-bubble" />
        <StatTile emoji="🔥" label="Mål pr. kamp" value={g.goalsPerMatch.toFixed(1)} color="bg-sky" />
        <StatTile emoji="📅" label="Travleste dag" value={`${g.busiestDay.count}`} sub={formatDate(g.busiestDay.date + "T12:00:00")} color="bg-lime" />
      </section>

      {/* ACTIVITY */}
      <section className="card-pop p-5">
        <h2 className="heading-xl text-xl">📈 Aktivitet pr. måned</h2>
        <ActivityChart data={g.activityByMonth} />
      </section>

      {/* MODE BREAKDOWN */}
      <section>
        <SectionTitle emoji="🎮" title="Spilformer" />
        <div className="card-pop space-y-4 p-5">
          {(["1v1", "1v2", "2v2"] as const).map((m) => {
            const count = g.modeBreakdown[m];
            const share = total ? count / total : 0;
            return (
              <div key={m}>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>{m}</span>
                  <span className="text-ink-soft">
                    {count} kampe · {pct(share)}
                  </span>
                </div>
                <div className="h-5 overflow-hidden rounded-full border-2 border-ink bg-paper">
                  <div className={`h-full ${MODE_COLOR[m]}`} style={{ width: `${Math.round(share * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEADERBOARDS */}
      <section>
        <SectionTitle emoji="🏆" title="Toplister" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MiniBoard data={data} stats={stats} emoji="⚽" title="Flest mål" value={(s) => s.goalsFor} format={(s) => `${s.goalsFor}`} />
          <MiniBoard data={data} stats={stats} emoji="🎯" title="Mål pr. kamp" value={(s) => s.goalsPerGame} format={(s) => s.goalsPerGame.toFixed(1)} />
          <MiniBoard data={data} stats={stats} emoji="🧱" title="Bedste forsvar" value={(s) => -s.concededPerGame} format={(s) => s.concededPerGame.toFixed(1)} />
          <MiniBoard data={data} stats={stats} emoji="📈" title="Bedste win-rate" value={(s) => s.winRate} format={(s) => pct(s.winRate)} />
          <MiniBoard data={data} stats={stats} emoji="☄️" title="Længste sejrsstime" value={(s) => s.longestWinStreak} format={(s) => `${s.longestWinStreak}`} />
          <MiniBoard data={data} stats={stats} emoji="🎰" title="Flest kampe" value={(s) => s.games} format={(s) => `${s.games}`} />
        </div>
      </section>

      {/* RECORD BOARD */}
      <section>
        <SectionTitle emoji="💥" title="Rekordtavlen" />
        <div className="space-y-4">
          <div>
            <p className="mb-1 font-bold text-ink-soft">🔪 Største øretæve</p>
            <ul className="card-pop overflow-hidden p-0">
              <MatchRow data={data} match={g.biggestMargin} />
            </ul>
          </div>
          <div>
            <p className="mb-1 font-bold text-ink-soft">🎉 Flest mål i én kamp</p>
            <ul className="card-pop overflow-hidden p-0">
              <MatchRow data={data} match={g.mostGoals} />
            </ul>
          </div>
          <div>
            <p className="mb-1 font-bold text-ink-soft">😬 Tætteste kamp</p>
            <ul className="card-pop overflow-hidden p-0">
              <MatchRow data={data} match={g.closest} />
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
