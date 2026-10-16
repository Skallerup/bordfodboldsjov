import Link from "next/link";
import { getData, playerSlug } from "@/lib/scrape";
import { allPlayerStats, globalStats, topRivalries, formatDate, pct } from "@/lib/stats/derive";
import { computeAwards, awardsForPlayer } from "@/lib/stats/badges";
import { moodFromForm } from "@/lib/face/seed";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerFace } from "@/components/PlayerFace";
import { SpeechBubble } from "@/components/SpeechBubble";
import { Ticker } from "@/components/Ticker";
import { BadgeMedal } from "@/components/BadgeMedal";
import { SectionTitle, StatTile } from "@/components/ui";

export const revalidate = 1800;

export default async function HomePage() {
  const data = await getData();
  const stats = allPlayerStats(data);
  const awards = computeAwards(data);
  const g = globalStats(data);
  const rivalries = topRivalries(data, 3);

  const ranked = [...data.players].sort((a, b) => b.rating - a.rating);
  const king = ranked[0];
  const kingMood = moodFromForm({ currentStreak: stats[king.id].current, winRate: stats[king.id].winRate });

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="card-pop halftone relative overflow-hidden p-6 sm:p-10">
        <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="chip bg-mustard">⚽ Kontorets statistik-univers</span>
            <h1 className="heading-xl mt-3 text-4xl sm:text-6xl">
              Hvor <span className="text-grape">tal</span> bliver til{" "}
              <span className="text-bubble">drama</span>.
            </h1>
            <p className="mt-3 max-w-md text-lg font-semibold text-ink-soft">
              Alle {g.totalMatches} kampe, {g.totalGoals.toLocaleString("da-DK")} mål og hver eneste
              øretæve — pakket ind i animerede ansigter, sjove grafer og badges.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/spillere" className="btn-pop bg-grape text-white">
                Mød spillerne
              </Link>
              <Link href="/badges" className="btn-pop bg-paper">
                🏅 Se badges
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-2 w-full max-w-[220px]">
              <SpeechBubble tone="grape">
                {king.short} fører feltet med {king.rating} i rating 👑
              </SpeechBubble>
            </div>
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">👑</div>
              <PlayerFace seed={king.name} mood={kingMood} size={200} />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold">{king.name}</p>
            <p className="text-sm font-semibold text-ink-soft">
              {pct(stats[king.id].winRate)} sejre · {stats[king.id].longestWinStreak} i streg
            </p>
          </div>
        </div>
      </section>

      <div className="-mx-4 sm:-mx-6">
        <Ticker data={data} />
      </div>

      {/* LEADERBOARD */}
      <section>
        <SectionTitle emoji="🏆" title="Stillingen" sub="Rangeret efter rating" href="/spillere" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((p, i) => (
            <PlayerCard
              key={p.id}
              player={p}
              stats={stats[p.id]}
              rank={i + 1}
              awards={awardsForPlayer(awards, p.id)}
            />
          ))}
        </div>
      </section>

      {/* FUN STATS */}
      <section>
        <SectionTitle emoji="🤯" title="Vilde tal" sub="Sæsonens ekstremer" href="/statistik" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile emoji="⚽" label="Mål i alt" value={g.totalGoals.toLocaleString("da-DK")} color="bg-mustard" />
          <StatTile emoji="🔥" label="Mål pr. kamp" value={g.goalsPerMatch.toFixed(1)} color="bg-bubble" />
          <StatTile
            emoji="💥"
            label="Største øretæve"
            value={`${g.biggestMargin.scoreA}–${g.biggestMargin.scoreB}`}
            color="bg-sky"
          />
          <StatTile
            emoji="📅"
            label="Travleste dag"
            value={`${g.busiestDay.count} kampe`}
            sub={formatDate(g.busiestDay.date + "T12:00:00")}
            color="bg-lime"
          />
        </div>
      </section>

      {/* BADGES TEASER */}
      <section>
        <SectionTitle emoji="🏅" title="Hædersbevisninger" sub="Hvem bærer hvilket emblem?" href="/badges" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awards.slice(0, 6).map((a) => (
            <BadgeMedal key={a.badge.id} award={a} winner={data.byId[a.winnerId]} />
          ))}
        </div>
      </section>

      {/* RIVALRIES TEASER */}
      <section>
        <SectionTitle emoji="⚔️" title="De store opgør" sub="Mest spillede rivaliseringer" href="/head-to-head" />
        <div className="grid gap-4 sm:grid-cols-3">
          {rivalries.map((r) => (
            <div key={`${r.a.id}-${r.b.id}`} className="card-pop flex items-center justify-between p-4">
              <div className="flex flex-col items-center">
                <PlayerFace seed={r.a.name} size={56} still />
                <span className="mt-1 text-sm font-bold">{r.a.short}</span>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-extrabold">
                  {r.winsA}–{r.winsB}
                </p>
                <p className="text-xs font-semibold text-ink-soft">{r.games} kampe</p>
              </div>
              <div className="flex flex-col items-center">
                <PlayerFace seed={r.b.name} size={56} still />
                <span className="mt-1 text-sm font-bold">{r.b.short}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
