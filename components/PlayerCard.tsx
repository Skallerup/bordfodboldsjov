import Link from "next/link";
import { PlayerFace } from "./PlayerFace";
import { SpeechBubble } from "./SpeechBubble";
import { FormDots } from "./FormDots";
import { BadgeChip } from "./BadgeMedal";
import { playerSlug } from "@/lib/scrape";
import { moodFromForm } from "@/lib/face/seed";
import { quipFor } from "@/lib/personality";
import { pct, type PlayerStats } from "@/lib/stats/derive";
import type { Award } from "@/lib/stats/badges";
import type { Player } from "@/lib/types";

const RANK_STYLE = ["bg-mustard", "bg-sky", "bg-bubble"];

export function PlayerCard({
  player,
  stats,
  rank,
  awards = [],
}: {
  player: Player;
  stats: PlayerStats;
  rank: number;
  awards?: Award[];
}) {
  const mood = moodFromForm({ currentStreak: stats.current, winRate: stats.winRate });
  const quip = quipFor(mood, player.id * 7 + stats.wins);
  const rankBg = RANK_STYLE[rank - 1] ?? "bg-paper";

  return (
    <Link
      href={`/spillere/${playerSlug(player)}`}
      className="card-pop group relative block p-5 transition-transform hover:-translate-y-1 hover:shadow-pop-lg"
    >
      <div
        className={`absolute -left-3 -top-3 grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink font-display text-lg font-extrabold shadow-pop-sm ${rankBg}`}
      >
        {rank}
      </div>

      <div className="flex items-start gap-4">
        <PlayerFace seed={player.name} mood={mood} size={88} />
        <div className="min-w-0 flex-1 pt-1">
          <SpeechBubble tone={rank === 1 ? "mustard" : "paper"}>{quip}</SpeechBubble>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-display text-2xl font-extrabold leading-none">
          {player.name}
          {player.provisional && <span title="Foreløbig rating" className="ml-1 text-base">⚠️</span>}
        </h3>
        <p className="text-sm font-semibold text-ink-soft">
          {stats.wins}–{stats.losses} · {stats.games} kampe
        </p>
      </div>

      {/* rating + winrate */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-ink bg-cream px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Rating</p>
          <p className="font-display text-2xl font-extrabold leading-none">{player.rating}</p>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-cream px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Win-rate</p>
          <p className="font-display text-2xl font-extrabold leading-none">{pct(stats.winRate)}</p>
        </div>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
        <div className="h-full bg-lime" style={{ width: `${Math.round(stats.winRate * 100)}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <FormDots form={stats.form.slice(-6)} />
        {awards.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {awards.slice(0, 3).map((a) => (
              <BadgeChip key={a.badge.id} award={a} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
