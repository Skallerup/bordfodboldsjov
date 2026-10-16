"use client";

import { motion } from "framer-motion";
import { faceFeatures, type Mood } from "@/lib/face/seed";

interface Props {
  seed: string;
  mood?: Mood;
  size?: number;
  /** Disable the idle bob (e.g. in dense tables). */
  still?: boolean;
  className?: string;
}

export function PlayerFace({ seed, mood = "neutral", size = 96, still = false, className }: Props) {
  const f = faceFeatures(seed);
  const showCheeks = mood === "happy" || mood === "smug";

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={still ? undefined : { y: [0, -5, 0] }}
      transition={still ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Ansigt: ${seed}`}>
        {/* soft shadow */}
        <ellipse cx="50" cy="92" rx="26" ry="5" fill="#26223822" />

        <Hair style={f.hairStyle} color={f.hair} />

        {/* head */}
        <circle cx="50" cy="52" r="34" fill={f.skin} stroke="#262238" strokeWidth="3" />

        {/* ears */}
        <circle cx="16" cy="54" r="6" fill={f.skin} stroke="#262238" strokeWidth="3" />
        <circle cx="84" cy="54" r="6" fill={f.skin} stroke="#262238" strokeWidth="3" />

        {showCheeks && (
          <>
            <ellipse cx="33" cy="62" rx="7" ry="5" fill={f.cheek} opacity="0.75" />
            <ellipse cx="67" cy="62" rx="7" ry="5" fill={f.cheek} opacity="0.75" />
          </>
        )}

        <HairFront style={f.hairStyle} color={f.hair} />

        <Brows mood={mood} />

        {/* eyes with idle blink */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          style={{ transformOrigin: "50px 48px" }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        >
          <Eye cx={38} mood={mood} style={f.eyeStyle} />
          <Eye cx={62} mood={mood} style={f.eyeStyle} />
        </motion.g>

        <Mouth mood={mood} />

        <Accessory kind={f.accessory} skin={f.skin} />
      </svg>
    </motion.div>
  );
}

function Eye({ cx, mood, style }: { cx: number; mood: Mood; style: number }) {
  if (mood === "happy") {
    // closed happy arc ^_^
    return (
      <path
        d={`M ${cx - 6} 50 Q ${cx} 44 ${cx + 6} 50`}
        stroke="#262238"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const r = style === 2 ? 5.5 : 4.5;
  const pupilY = mood === "sad" ? 50 : 48;
  return (
    <g>
      <ellipse cx={cx} cy={48} rx={r} ry={style === 1 ? 6 : 5.5} fill="#fff" stroke="#262238" strokeWidth="2.2" />
      <circle cx={cx + (mood === "smug" ? 1.5 : 0)} cy={pupilY} r="2.4" fill="#262238" />
    </g>
  );
}

function Brows({ mood }: { mood: Mood }) {
  if (mood === "angry") {
    return (
      <g stroke="#262238" strokeWidth="3.4" strokeLinecap="round">
        <line x1="31" y1="38" x2="44" y2="42" />
        <line x1="69" y1="38" x2="56" y2="42" />
      </g>
    );
  }
  if (mood === "smug") {
    return (
      <g stroke="#262238" strokeWidth="3.2" strokeLinecap="round">
        <line x1="32" y1="40" x2="44" y2="40" />
        <line x1="56" y1="36" x2="68" y2="39" />
      </g>
    );
  }
  if (mood === "sad") {
    return (
      <g stroke="#262238" strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M32 40 Q38 37 44 40" />
        <path d="M56 40 Q62 37 68 40" />
      </g>
    );
  }
  return null;
}

function Mouth({ mood }: { mood: Mood }) {
  const common = { stroke: "#262238", strokeWidth: 3.2, fill: "none", strokeLinecap: "round" as const };
  switch (mood) {
    case "happy":
      return <path d="M38 66 Q50 78 62 66" {...common} fill="#C2384D" />;
    case "smug":
      return <path d="M40 68 Q52 72 62 64" {...common} />;
    case "sad":
      return <path d="M40 72 Q50 64 60 72" {...common} />;
    case "angry":
      return (
        <g>
          <path d="M39 66 Q50 62 61 66 Q50 76 39 66 Z" fill="#C2384D" stroke="#262238" strokeWidth="2.6" />
          <line x1="44" y1="66" x2="46" y2="71" stroke="#fff" strokeWidth="2" />
          <line x1="50" y1="67" x2="50" y2="72" stroke="#fff" strokeWidth="2" />
          <line x1="56" y1="66" x2="54" y2="71" stroke="#fff" strokeWidth="2" />
        </g>
      );
    default:
      return <line x1="42" y1="68" x2="58" y2="68" {...common} />;
  }
}

function Hair({ style, color }: { style: number; color: string }) {
  // Back layer (behind head) for volume
  switch (style) {
    case 3: // curly
      return (
        <g fill={color} stroke="#262238" strokeWidth="2.4">
          <circle cx="26" cy="34" r="10" />
          <circle cx="42" cy="24" r="11" />
          <circle cx="58" cy="24" r="11" />
          <circle cx="74" cy="34" r="10" />
        </g>
      );
    case 1: // spiky back
      return null;
    default:
      return null;
  }
}

function HairFront({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0: // short rounded
      return (
        <path
          d="M20 46 Q20 20 50 20 Q80 20 80 46 Q66 34 50 34 Q34 34 20 46 Z"
          fill={color}
          stroke="#262238"
          strokeWidth="3"
        />
      );
    case 1: // spiky
      return (
        <path
          d="M22 44 L28 26 L34 40 L41 22 L48 40 L54 22 L61 40 L67 26 L73 44 Q50 32 22 44 Z"
          fill={color}
          stroke="#262238"
          strokeWidth="2.6"
        />
      );
    case 2: // bald-ish: just a tuft
      return <path d="M46 20 Q50 14 54 20 Q50 22 46 20 Z" fill={color} stroke="#262238" strokeWidth="2.4" />;
    case 3: // curly front fringe
      return null;
    default: // side swoosh
      return (
        <path
          d="M20 44 Q24 22 52 22 Q78 22 78 40 Q70 30 46 30 Q30 30 20 44 Z"
          fill={color}
          stroke="#262238"
          strokeWidth="3"
        />
      );
  }
}

function Accessory({ kind, skin }: { kind: number; skin: string }) {
  switch (kind) {
    case 1: // glasses
      return (
        <g stroke="#262238" strokeWidth="2.6" fill="none">
          <circle cx="38" cy="48" r="8" />
          <circle cx="62" cy="48" r="8" />
          <line x1="46" y1="48" x2="54" y2="48" />
        </g>
      );
    case 2: // cap
      return (
        <g>
          <path d="M18 34 Q50 12 82 34 Q50 26 18 34 Z" fill="#7C5CFC" stroke="#262238" strokeWidth="3" />
          <path d="M18 34 Q10 36 8 40 L22 40 Z" fill="#7C5CFC" stroke="#262238" strokeWidth="3" />
        </g>
      );
    case 3: // sweatband
      return <rect x="18" y="32" width="64" height="7" rx="3.5" fill="#FF5E57" stroke="#262238" strokeWidth="2.6" />;
    default:
      return null;
  }
}
