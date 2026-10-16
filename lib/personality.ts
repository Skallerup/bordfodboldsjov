import type { Mood } from "@/lib/face/seed";

/** Context-aware Danish one-liners for speech bubbles, keyed by mood. */
const QUIPS: Record<Mood, string[]> = {
  smug: [
    "Var der nogen der sagde noget?",
    "Jeg tæller ikke sejrene længere.",
    "Bordet er mit kontor.",
    "Kom igen når I har trænet.",
  ],
  happy: [
    "Hvem er klar på en tur til?",
    "Det var faktisk ret sjovt!",
    "God kamp — næsten.",
    "Jeg elsker den her lyd: MÅÅÅL!",
  ],
  neutral: [
    "Én kamp ad gangen.",
    "Vi ses ved bordet.",
    "Formen kommer.",
    "Hvem har bolden?",
  ],
  angry: [
    "Det der var held!",
    "Revanche. Nu.",
    "Stangen tæller IKKE.",
    "Jeg varmede ikke op.",
  ],
  sad: [
    "Måske kaffe i stedet?",
    "Det kan kun gå fremad...",
    "Jeg havde solen i øjnene.",
    "Nogen må holde med mig.",
  ],
};

export function quipFor(mood: Mood, seed: number): string {
  const list = QUIPS[mood];
  return list[seed % list.length];
}
