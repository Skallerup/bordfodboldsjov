"use client";

import { useRouter } from "next/navigation";

const MODES = ["alle", "1v1", "1v2", "2v2"] as const;

export function KampeFilter({
  options,
  mode,
  player,
}: {
  options: { slug: string; name: string }[];
  mode: string;
  player: string;
}) {
  const router = useRouter();
  const nav = (m: string, p: string) => {
    const q = new URLSearchParams();
    if (m && m !== "alle") q.set("mode", m);
    if (p) q.set("spiller", p);
    const qs = q.toString();
    router.push(`/kampe${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => nav(m, player)}
            className={`rounded-xl border-[3px] border-ink px-3 py-1.5 font-display font-extrabold shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
              mode === m ? "bg-grape text-white" : "bg-paper"
            }`}
          >
            {m === "alle" ? "Alle" : m}
          </button>
        ))}
      </div>
      <select
        value={player}
        onChange={(e) => nav(mode, e.target.value)}
        className="rounded-xl border-[3px] border-ink bg-paper px-3 py-1.5 font-display font-extrabold shadow-pop-sm focus:outline-none"
      >
        <option value="">Alle spillere</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
