import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Game-specific colors
        game: {
          primary: '#8B5CF6',
          secondary: '#3B82F6',
          accent: '#10B981',
          fire: '#EF4444',
          water: '#3B82F6',
          earth: '#10B981',
          air: '#6B7280',
          gold: '#F59E0B',
          silver: '#9CA3AF',
        },
        element: {
          fire: '#EF4444',
          water: '#3B82F6',
          earth: '#10B981',
          air: '#6B7280',
        },
        tier: {
          common: '#6B7280',
          rare: '#3B82F6',
          epic: '#A855F7',
          legendary: '#F59E0B',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "battle-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "damage-flash": {
          "0%": { backgroundColor: "rgb(239, 68, 68)" },
          "100%": { backgroundColor: "transparent" },
        },
        "heal-flash": {
          "0%": { backgroundColor: "rgb(16, 185, 129)" },
          "100%": { backgroundColor: "transparent" },
        },
        "level-up": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.2) rotate(180deg)" },
          "100%": { transform: "scale(1) rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "battle-pulse": "battle-pulse 2s ease-in-out infinite",
        "damage-flash": "damage-flash 0.3s ease-out",
        "heal-flash": "heal-flash 0.3s ease-out",
        "level-up": "level-up 1s ease-in-out",
      },
      backgroundImage: {
        'battle-arena': "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        'game-gradient': "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        'fire-gradient': "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
        'water-gradient': "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
        'earth-gradient': "linear-gradient(135deg, #00b894 0%, #00a085 100%)",
        'air-gradient': "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
      },
      fontFamily: {
        game: ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config