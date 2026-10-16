/**
 * Deterministic cartoon-face features. We only know player names (no photos),
 * so each player gets a stable procedurally-generated look seeded from their
 * name — same input, same face, every render.
 */

export type Mood = "happy" | "smug" | "sad" | "angry" | "neutral";

export interface FaceFeatures {
  skin: string;
  hair: string;
  hairStyle: number; // 0-4
  eyeStyle: number; // 0-2
  accessory: number; // 0-3 (0 = none)
  cheek: string;
}

const SKINS = ["#FFD9B3", "#F2C49B", "#E8B98C", "#D9A066", "#C68642", "#FFE0C7"];
const HAIRS = ["#3B2A1F", "#6B4423", "#1B1B2B", "#C25A3A", "#E8B84B", "#8A8A9E", "#2E5E8C"];
const CHEEKS = ["#FF9FB4", "#FFB3A0", "#FFA7C4"];

/** Simple stable string hash. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function faceFeatures(seed: string): FaceFeatures {
  const h = hashString(seed);
  return {
    skin: SKINS[h % SKINS.length],
    hair: HAIRS[(h >> 3) % HAIRS.length],
    hairStyle: (h >> 6) % 5,
    eyeStyle: (h >> 9) % 3,
    accessory: (h >> 12) % 4,
    cheek: CHEEKS[(h >> 15) % CHEEKS.length],
  };
}

/** Pick a mood from a player's current form + win rate. */
export function moodFromForm(opts: {
  currentStreak?: { type: "W" | "L"; length: number };
  winRate: number;
}): Mood {
  const { currentStreak, winRate } = opts;
  if (currentStreak) {
    if (currentStreak.type === "W" && currentStreak.length >= 3) return "smug";
    if (currentStreak.type === "L" && currentStreak.length >= 3) return "sad";
  }
  if (winRate >= 0.6) return "happy";
  if (winRate <= 0.3) return "sad";
  if (currentStreak?.type === "W") return "happy";
  if (currentStreak?.type === "L") return "angry";
  return "neutral";
}
