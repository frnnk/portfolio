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
      // Fluid type: each tier passes through its current px size around 1440px
      // (so normal desktops are unchanged) and scales up to its max near 2560px.
      fontSize: {
        "fluid-2xs": "clamp(8px, 0.36vw + 3.8px, 13px)",
        "fluid-xs": "clamp(10px, 0.36vw + 5.8px, 15px)",
        "fluid-sm": "clamp(12px, 0.31vw + 8px, 16px)",
        "fluid-base": "clamp(13px, 0.54vw + 6.2px, 20px)",
        "fluid-lg": "clamp(17px, 0.89vw + 5.2px, 28px)",
        "fluid-h1": "clamp(18px, 0.89vw + 7.2px, 30px)",
        "fluid-h2": "clamp(15px, 0.71vw + 5.8px, 24px)",
        "fluid-h3": "clamp(12px, 0.54vw + 5.2px, 19px)",
        "fluid-h4": "clamp(11px, 0.45vw + 4.5px, 16px)",
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
