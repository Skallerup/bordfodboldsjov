import type { RatingPoint } from "@/lib/stats/elo";

/**
 * Hand-rolled inline SVG line chart — server-rendered, no measurement or
 * client JS needed, so the "formkurve" always shows up (print, SSR, headless).
 */
export function RatingChart({ points, color = "#7C5CFC" }: { points: RatingPoint[]; color?: string }) {
  const W = 600;
  const H = 200;
  const PAD = 10;

  if (points.length < 2) {
    return <p className="py-10 text-center font-semibold text-ink-soft">Ikke nok kampe til en kurve endnu.</p>;
  }

  const ratings = points.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = max - min || 1;

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - 2 * PAD);
  const y = (r: number) => PAD + (1 - (r - min) / span) * (H - 2 * PAD);

  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.rating).toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const last = points[points.length - 1];

  // Horizontal guide lines at min / mid / max.
  const guides = [min, Math.round((min + max) / 2), max];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {guides.map((g) => (
          <line
            key={g}
            x1={PAD}
            x2={W - PAD}
            y1={y(g)}
            y2={y(g)}
            stroke="#26223820"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        <polygon points={area} fill="url(#ratingFill)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(points.length - 1)} cy={y(last.rating)} r="5" fill={color} stroke="#262238" strokeWidth="2.5" />
      </svg>
      <div className="mt-1 flex justify-between text-xs font-bold text-ink-soft">
        <span>lav: {min}</span>
        <span>høj: {max}</span>
        <span>nu: {last.rating}</span>
      </div>
    </div>
  );
}
