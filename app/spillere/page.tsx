import { getData } from "@/lib/scrape";
import { allPlayerStats } from "@/lib/stats/derive";
import { computeAwards, awardsForPlayer } from "@/lib/stats/badges";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionTitle } from "@/components/ui";

export const revalidate = 1800;

export const metadata = { title: "Spillerne — Bordfodbold SJOV" };

export default async function SpillerePage() {
  const data = await getData();
  const stats = allPlayerStats(data);
  const awards = computeAwards(data);
  const ranked = [...data.players].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <SectionTitle
        emoji="🧑‍🎤"
        title="Truppen"
        sub={`${data.players.length} spillere · klik for fuld profil`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            stats={stats[p.id]}
            rank={i + 1}
            awards={awardsForPlayer(awards, p.id)}
          />
        ))}
      </div>
    </div>
  );
}
