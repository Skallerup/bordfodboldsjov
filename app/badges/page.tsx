import { getData } from "@/lib/scrape";
import { BADGES, computeAwards } from "@/lib/stats/badges";
import { BadgeMedal } from "@/components/BadgeMedal";
import { SectionTitle } from "@/components/ui";

export const revalidate = 1800;

export const metadata = { title: "Badges — Bordfodbold SJOV" };

export default async function BadgesPage() {
  const data = await getData();
  const awards = computeAwards(data);

  return (
    <div className="space-y-6">
      <SectionTitle
        emoji="🏅"
        title="Hædersgalleriet"
        sub={`${BADGES.length} emblemer — nogle vil du helst undgå`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {BADGES.map((b) => {
          const award = awards.find((a) => a.badge.id === b.id);
          if (award) {
            return <BadgeMedal key={b.id} award={award} winner={data.byId[award.winnerId]} />;
          }
          const { pick: _omit, ...badge } = b;
          return (
            <div key={b.id} className="card-pop flex items-center gap-4 p-4 opacity-60">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-[3px] border-ink text-3xl ${badge.color}`}>
                {badge.emoji}
              </div>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight">{badge.name}</p>
                <p className="text-xs font-semibold text-ink-soft">{badge.criteria}</p>
                <p className="mt-1 text-sm font-bold text-ink-soft">Ingen indehaver endnu</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
