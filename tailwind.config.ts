import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2C5F7C",
          light: "#4A8BAD",
          dark: "#1A3D52",
        },
        accent: {
          DEFAULT: "#C4704B",
          light: "#E8A383",
        },
        background: "#FAF7F2",
        surface: "#FFFFFF",
        "surface-variant": "#F0EDE6",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "text-light": "#9E9E9E",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
