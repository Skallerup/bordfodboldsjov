const DK = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function label(month: string) {
  const [, m] = month.split("-");
  return DK[Number(m) - 1] ?? month;
}

/** Inline SVG-free bar chart — pure fl/CSS, server-rendered, always visible. */
export function ActivityChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-56 items-end gap-2 pt-4">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <span className="font-display text-sm font-extrabold">{d.count}</span>
          <div
            className="w-full rounded-t-lg border-2 border-ink bg-sky transition-all"
            style={{ height: `${Math.max(6, (d.count / max) * 170)}px` }}
            title={`${d.count} kampe`}
          />
          <span className="text-[11px] font-bold text-ink-soft">{label(d.month)}</span>
        </div>
      ))}
    </div>
  );
}
