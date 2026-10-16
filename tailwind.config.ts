import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF6E5",
        paper: "#FFFDF7",
        ink: "#262238",
        "ink-soft": "#6B6580",
        grape: "#7C5CFC",
        bubble: "#FF6FA5",
        lime: "#7FD957",
        sky: "#49C6FF",
        mustard: "#FFC53D",
        tomato: "#FF5E57",
        mint: "#4FE0C4",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        blob: "42% 58% 63% 37% / 41% 44% 56% 59%",
      },
      boxShadow: {
        pop: "4px 4px 0 0 #262238",
        "pop-lg": "7px 7px 0 0 #262238",
        "pop-sm": "2px 2px 0 0 #262238",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "70%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out infinite",
        "pop-in": "pop-in 0.4s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
