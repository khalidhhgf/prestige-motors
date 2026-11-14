import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0c",
        charcoal: { DEFAULT: "#1a1a1d", 800: "#232327", 700: "#2e2e33", 500: "#6b6b73", 300: "#a8a8b0" },
        bone: "#f6f4f0",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-2": "var(--accent-2)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: { wide2: "0.18em" },
    },
  },
  plugins: [],
};
export default config;
