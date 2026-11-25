import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#102F55",
          deep: "#082747",
          dark: "#0b223d",
          light: "#1c4a80",
          soft: "#EEF4FA",
        },
        gold: {
          DEFAULT: "#E9BC58",
          dark: "#d4a742",
          light: "#f7df96",
          soft: "#fdf8ec",
        },
        softgray: "#F5F7FA",
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(16, 47, 85, 0.08)",
        cardHover: "0 20px 40px -10px rgba(16, 47, 85, 0.16)",
        gold: "0 10px 25px -5px rgba(233, 188, 88, 0.35)",
        navy: "0 10px 30px -5px rgba(8, 39, 71, 0.4)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
