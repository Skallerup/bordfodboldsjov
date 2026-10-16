import type { Award } from "@/lib/stats/badges";
import type { Player } from "@/lib/types";

export function BadgeMedal({
  award,
  winner,
  showWinner = true,
}: {
  award: Award;
  winner?: Player;
  showWinner?: boolean;
}) {
  const { badge, detail } = award;
  return (
    <div className="card-pop flex items-center gap-4 p-4">
      <div
        className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-[3px] border-ink text-3xl shadow-pop-sm ${badge.color}`}
      >
        {badge.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-extrabold leading-tight">{badge.name}</p>
        <p className="text-xs font-semibold text-ink-soft">{badge.tagline}</p>
        {showWinner && winner && (
          <p className="mt-1 text-sm font-bold">
            🏆 {winner.name} <span className="text-ink-soft">· {detail}</span>
          </p>
        )}
        {!showWinner && <p className="mt-1 text-sm font-bold text-ink-soft">{detail}</p>}
      </div>
    </div>
  );
}

export function BadgeChip({ award }: { award: Award }) {
  return (
    <span
      title={`${award.badge.name} — ${award.detail}`}
      className={`chip ${award.badge.color} border-ink`}
    >
      <span>{award.badge.emoji}</span>
      <span className="hidden sm:inline">{award.badge.name}</span>
    </span>
  );
}
