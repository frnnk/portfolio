import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#eeeeee",
        "background-dark": "#000000",
        gray: {
          900: "#111111",
          800: "#333333",
          600: "#666666",
          400: "#999999",
          200: "#cccccc",
        },
        highlight: "#eeeeee",
      },
      fontFamily: {
        display: ["Ioskeley Mono", "monospace"],
        mono: ["Ioskeley Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
    },
  },
  plugins: [typography],
} satisfies Config
