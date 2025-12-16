/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#36e27b",
        "primary-hover": "#14b89d",
        "background-light": "#f6f8f7",
        "background-dark": "#112117",
        "surface-dark": "#1c2e24",
        "card-dark": "#1c2625",
        "border-dark": "#293836",
        "input-bg": "#151f1d",
      },
      fontFamily: {
        "display": ["Spline Sans", "Noto Sans", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        full: "9999px"
      },
      boxShadow: {
        "glow": "0 0 20px -5px rgba(54, 226, 123, 0.3)",
      }
    },
  },
  plugins: [],
}

