import { notFound } from "next/navigation";
import Link from "next/link";
import { getData, playerByShortOrId, playerSlug } from "@/lib/scrape";
import {
  computePlayerStats,
  headToHead,
  playerMatches,
  pct,
  WEEKDAYS,
} from "@/lib/stats/derive";
import { ratingHistory } from "@/lib/stats/elo";
import { computeAwards, awardsForPlayer } from "@/lib/stats/badges";
import { moodFromForm } from "@/lib/face/seed";
import { quipFor } from "@/lib/personality";
import { PlayerFace } from "@/components/PlayerFace";
import { SpeechBubble } from "@/components/SpeechBubble";
import { FormDots } from "@/components/FormDots";
import { BadgeMedal } from "@/components/BadgeMedal";
import { MatchRow } from "@/components/MatchRow";
import { RatingChart } from "@/components/charts/RatingChart";
import { StatTile } from "@/components/ui";

export const revalidate = 1800;

export async function generateStaticParams() {
  const data = await getData();
  return data.players.map((p) => ({ navn: p.short.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ navn: string }> }) {
  const { navn } = await params;
  const data = await getData();
  const p = playerByShortOrId(data, navn);
  return { title: p ? `${p.name} — Bordfodbold SJOV` : "Spiller — Bordfodbold SJOV" };
}

export default async function PlayerPage({ params }: { params: Promise<{ navn: string }> }) {
  const { navn } = await params;
  const data = await getData();
  const player = playerByShortOrId(data, navn);
  if (!player) notFound();

  const s = computePlayerStats(data, player.id);
  const awards = awardsForPlayer(computeAwards(data), player.id);
  const history = ratingHistory(data)[player.id] ?? [];
  const ranked = [...data.players].sort((a, b) => b.rating - a.rating);
  const rank = ranked.findIndex((p) => p.id === player.id) + 1;
  const mood = moodFromForm({ currentStreak: s.current, winRate: s.winRate });
  const quip = quipFor(mood, player.id * 3 + s.games);

  const opponents = data.players.filter((p) => p.id !== player.id);
  const recent = [...playerMatches(data, player.id)].reverse().slice(0, 12);

  return (
    <div className="space-y-10">
      <Link href="/spillere" className="text-sm font-bold text-ink-soft hover:text-grape">
        ← Tilbage til truppen
      </Link>

      {/* HEADER */}
      <section className="card-pop halftone grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
        <div className="flex flex-col items-center">
          {rank === 1 && <div className="text-4xl">👑</div>}
          <PlayerFace seed={player.name} mood={mood} size={168} />
        </div>
        <div>
          <div className="max-w-xs">
            <SpeechBubble tone="mustard">{quip}</SpeechBubble>
          </div>
          <h1 className="heading-xl mt-4 text-4xl sm:text-5xl">
            {player.name}
            {player.provisional && <span title="Foreløbig rating" className="ml-2 text-2xl">⚠️</span>}
          </h1>
          <p className="mt-1 text-lg font-bold text-ink-soft">
            #{rank} i stillingen · {s.wins}–{s.losses} · {pct(s.winRate)} sejre
          </p>
          <div className="mt-3 flex items-center gap-3">
            <FormDots form={s.form} />
            <span className="chip bg-paper">
              {s.current.type === "W" ? "🔥" : "🧊"} {s.current.length} i streg
            </span>
          </div>
        </div>
      </section>

      {/* STAT TILES */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile emoji="⭐" label="Rating" value={player.rating} color="bg-mustard" />
        <StatTile emoji="⚽" label="Mål scoret" value={s.goalsFor} sub={`${s.goalsPerGame.toFixed(1)} pr. kamp`} color="bg-bubble" />
        <StatTile emoji="🧤" label="Mål indkasseret" value={s.goalsAgainst} sub={`${s.concededPerGame.toFixed(1)} pr. kamp`} color="bg-sky" />
        <StatTile emoji="➕" label="Måldifference" value={(s.goalDiff > 0 ? "+" : "") + s.goalDiff} color="bg-lime" />
        <StatTile emoji="☄️" label="Længste sejrsstime" value={s.longestWinStreak} />
        <StatTile emoji="😰" label="Længste nederlagsstime" value={s.longestLossStreak} />
        <StatTile emoji="🥚" label="Æg serveret / modtaget" value={`${s.eggsServed} / ${s.eggsReceived}`} />
        {s.bestWeekday && (
          <StatTile emoji="🦸" label="Bedste ugedag" value={s.bestWeekday.day} sub={`${pct(s.bestWeekday.winRate)} over ${s.bestWeekday.games} kampe`} />
        )}
      </section>

      {/* RATING CHART */}
      <section className="card-pop p-5">
        <h2 className="heading-xl text-xl">📈 Formkurve <span className="text-sm font-semibold text-ink-soft">(rekonstrueret)</span></h2>
        <p className="mb-2 text-sm font-semibold text-ink-soft">Vores egen ELO-genspilning af alle kampe — viser momentum, ikke den officielle rating.</p>
        <RatingChart points={history} />
      </section>

      {/* BADGES */}
      {awards.length > 0 && (
        <section>
          <h2 className="heading-xl mb-4 text-2xl">🏅 Optjente badges</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {awards.map((a) => (
              <BadgeMedal key={a.badge.id} award={a} showWinner={false} />
            ))}
          </div>
        </section>
      )}

      {/* MODE BREAKDOWN */}
      <section>
        <h2 className="heading-xl mb-4 text-2xl">🎮 Pr. spilform</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["1v1", "1v2", "2v2"] as const).map((m) => {
            const mm = s.byMode[m];
            const wr = mm.games ? mm.wins / mm.games : 0;
            return (
              <div key={m} className="card-pop p-4">
                <p className="font-display text-xl font-extrabold">{m}</p>
                <p className="text-sm font-semibold text-ink-soft">
                  {mm.wins}/{mm.games} sejre · {pct(wr)}
                </p>
                <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
                  <div className="h-full bg-grape" style={{ width: `${Math.round(wr * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HEAD TO HEAD */}
      <section>
        <h2 className="heading-xl mb-4 text-2xl">⚔️ Head-to-head</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {opponents.map((o) => {
            const h = headToHead(data, player.id, o.id);
            if (h.games === 0) return null;
            const lead = h.winsA > h.winsB;
            return (
              <Link
                key={o.id}
                href={`/head-to-head?a=${playerSlug(player)}&b=${playerSlug(o)}`}
                className="card-pop flex items-center justify-between p-4 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <PlayerFace seed={o.name} size={44} still />
                  <span className="font-bold">{o.short}</span>
                </div>
                <span className={`font-display text-xl font-extrabold ${lead ? "text-lime" : "text-tomato"}`}>
                  {h.winsA}–{h.winsB}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT MATCHES */}
      <section>
        <h2 className="heading-xl mb-4 text-2xl">📜 Seneste kampe</h2>
        <ul className="card-pop overflow-hidden p-0">
          {recent.map((m) => (
            <MatchRow key={m.id} data={data} match={m} highlightId={player.id} />
          ))}
        </ul>
      </section>
    </div>
  );
}
