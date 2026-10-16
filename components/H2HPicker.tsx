"use client";

import { useRouter } from "next/navigation";

interface Opt {
  slug: string;
  name: string;
}

export function H2HPicker({ options, a, b }: { options: Opt[]; a: string; b: string }) {
  const router = useRouter();
  const go = (na: string, nb: string) => router.push(`/head-to-head?a=${na}&b=${nb}`);

  const select = (value: string, onChange: (v: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border-[3px] border-ink bg-paper px-3 py-2 font-display font-extrabold shadow-pop-sm focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex items-center justify-center gap-3">
      {select(a, (v) => go(v, b))}
      <span className="font-display text-xl font-extrabold text-ink-soft">vs</span>
      {select(b, (v) => go(a, v))}
    </div>
  );
}
