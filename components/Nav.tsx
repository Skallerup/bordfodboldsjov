"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Forsiden", emoji: "🏠" },
  { href: "/spillere", label: "Spillere", emoji: "🧑‍🎤" },
  { href: "/badges", label: "Badges", emoji: "🏅" },
  { href: "/statistik", label: "Statistik", emoji: "📊" },
  { href: "/head-to-head", label: "Head-to-head", emoji: "⚔️" },
  { href: "/kampe", label: "Kampe", emoji: "📜" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border-[3px] border-ink bg-mustard text-xl shadow-pop-sm transition-transform group-hover:rotate-6">
            ⚽
          </span>
          <span className="font-display text-xl font-extrabold leading-none sm:text-2xl">
            Bordfodbold <span className="text-grape">SJOV</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                isActive(l.href)
                  ? "border-ink bg-grape text-white shadow-pop-sm"
                  : "border-transparent hover:border-ink hover:bg-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl border-2 border-ink bg-paper px-3 py-1.5 font-display font-bold md:hidden"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-2 border-t-2 border-ink/20 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl border-2 border-ink px-3 py-2 text-sm font-bold ${
                isActive(l.href) ? "bg-grape text-white" : "bg-paper"
              }`}
            >
              {l.emoji} {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
