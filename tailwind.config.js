/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI Variable", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Cascadia Code", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#07070c",
          900: "#0b0b12",
          850: "#101018",
          800: "#15151f",
          750: "#1b1b26",
          700: "#23232f",
          600: "#33333f",
        },
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-18px,0) scale(1.04)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        "wave": { "0%, 100%": { transform: "scaleY(0.35)" }, "50%": { transform: "scaleY(1)" } },
        "caret-blink": { "0%, 45%": { opacity: "1" }, "50%, 95%": { opacity: "0" } },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 9s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        "pulse-ring": "pulse-ring 1.9s cubic-bezier(0.22,1,0.36,1) infinite",
        "caret-blink": "caret-blink 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
