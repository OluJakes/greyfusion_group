import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: { DEFAULT: "#121417", 2: "#1A1D22", 3: "#22262C" },
        titanium: "#8B939E",
        mist: "#E8EAED",
        paper: "#F7F8FA",
        fusion: { DEFAULT: "#E2583E", deep: "#C9432B", soft: "#F0765D" },
        amber: { signal: "#F59E0B" },
        div: {
          construction: "#D97706",
          energy: "#16A34A",
          it: "#6366F1",
          realestate: "#0D9488",
          autos: "#38BDF8",
          commerce: "#E11D48"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'IBM Plex Sans'", "Inter", "ui-sans-serif", "sans-serif"]
      },
      transitionTimingFunction: { fusion: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      borderRadius: { "2xl": "1rem" }
    }
  },
  plugins: []
};
export default config;
