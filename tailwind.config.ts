import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        clubTaro: "#cc88f9",
        clubPurple: "#9368FB",
        clubBlurple: "#684EFE",
      },
      fontFamily: {
        "fira-sans": ["Fira Sans", "sans-serif"],
      },
      text: {
        xxs: "0.625rem",
      },
    },
  },
  plugins: [],
};
export default config;
