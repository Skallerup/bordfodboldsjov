import Link from "next/link";

export function SectionTitle({
  emoji,
  title,
  sub,
  href,
  hrefLabel,
}: {
  emoji?: string;
  title: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="heading-xl text-2xl sm:text-3xl">
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </h2>
        {sub && <p className="text-sm font-semibold text-ink-soft">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="btn-pop shrink-0 bg-paper text-sm">
          {hrefLabel ?? "Se alle"} →
        </Link>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  color = "bg-paper",
  emoji,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color?: string;
  emoji?: string;
}) {
  return (
    <div className={`card-pop p-4 ${color}`}>
      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {emoji && <span>{emoji}</span>}
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold leading-none">{value}</p>
      {sub && <p className="mt-1 text-xs font-semibold text-ink-soft">{sub}</p>}
    </div>
  );
}
