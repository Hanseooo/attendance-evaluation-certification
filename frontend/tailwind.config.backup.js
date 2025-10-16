/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // enables dark mode using "class"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      colors: {
        // --- LIGHT MODE ---
        background: "#ffffff",
        foreground: "#0a0a0a",

        card: {
          DEFAULT: "#ffffff",
          foreground: "#0a0a0a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0a0a0a",
        },

        primary: {
          DEFAULT: "#0a0a0a", // black
          foreground: "#ffffff", // white text
        },
        secondary: {
          DEFAULT: "#f5f5f5", // light gray
          foreground: "#0a0a0a",
        },
        muted: {
          DEFAULT: "#f4f4f5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#f4f4f5",
          foreground: "#0a0a0a",
        },
        destructive: {
          DEFAULT: "#dc2626", // neutral red
          foreground: "#ffffff",
        },

        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#0a0a0a",

        // Chart neutrals (optional)
        chart: {
          "1": "#404040",
          "2": "#737373",
          "3": "#a3a3a3",
          "4": "#d4d4d4",
          "5": "#171717",
        },

        // --- DARK MODE ---
        // handled via class, so invert neutrals
        dark: {
          background: "#0a0a0a",
          foreground: "#fafafa",

          card: {
            DEFAULT: "#171717",
            foreground: "#fafafa",
          },
          popover: {
            DEFAULT: "#171717",
            foreground: "#fafafa",
          },

          primary: {
            DEFAULT: "#fafafa",
            foreground: "#0a0a0a",
          },
          secondary: {
            DEFAULT: "#262626",
            foreground: "#fafafa",
          },
          muted: {
            DEFAULT: "#262626",
            foreground: "#a3a3a3",
          },
          accent: {
            DEFAULT: "#262626",
            foreground: "#fafafa",
          },
          destructive: {
            DEFAULT: "#ef4444",
            foreground: "#fafafa",
          },

          border: "#262626",
          input: "#262626",
          ring: "#fafafa",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
