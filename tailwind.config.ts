import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#000000",
          card: "#1C1C1E",
          secondary: "#2C2C2E",
        },
        accent: {
          green: "#30D158",
          red: "#FF453A",
          blue: "#0A84FF",
          orange: "#FF9F0A",
        },
        muted: "#8E8E93",
        "text-secondary": "#8E8E93",
        "text-tertiary": "#48484A",
      },
      animation: {
        "pulse-glow": "fadeIn 0.3s ease-out",
        "live-blink": "liveBlink 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        liveBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
