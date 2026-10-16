import { getData, playerByShortOrId, playerSlug } from "@/lib/scrape";
import { side } from "@/lib/stats/derive";
import { MatchRow } from "@/components/MatchRow";
import { KampeFilter } from "@/components/KampeFilter";
import { SectionTitle } from "@/components/ui";
import type { Mode } from "@/lib/types";

export const revalidate = 1800;

export const metadata = { title: "Kamparkiv — Bordfodbold SJOV" };

export default async function KampePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; spiller?: string }>;
}) {
  const { mode, spiller } = await searchParams;
  const data = await getData();
  const ranked = [...data.players].sort((a, b) => b.rating - a.rating);
  const options = ranked.map((p) => ({ slug: playerSlug(p), name: p.name }));

  const selected = spiller ? playerByShortOrId(data, spiller) : undefined;
  const activeMode = (["1v1", "1v2", "2v2"] as Mode[]).includes(mode as Mode) ? (mode as Mode) : "alle";

  let matches = [...data.matches].reverse();
  if (activeMode !== "alle") matches = matches.filter((m) => m.mode === activeMode);
  if (selected) matches = matches.filter((m) => side(m, selected.id) !== null);

  return (
    <div className="space-y-6">
      <SectionTitle emoji="📜" title="Kamparkivet" sub={`${data.matches.length} kampe registreret`} />

      <KampeFilter options={options} mode={activeMode} player={selected ? playerSlug(selected) : ""} />

      <p className="text-sm font-bold text-ink-soft">
        Viser {matches.length} kampe
        {selected ? ` med ${selected.short}` : ""}
        {activeMode !== "alle" ? ` · ${activeMode}` : ""}
      </p>

      <ul className="card-pop overflow-hidden p-0">
        {matches.map((m) => (
          <MatchRow key={m.id} data={data} match={m} highlightId={selected?.id} />
        ))}
      </ul>
    </div>
  );
}
