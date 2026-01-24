/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        jurassic: {
          leaf: '#166534',
          rock: '#451a03',
          volcano: '#991b1b',
          glow: '#fbbf24',
          sky: '#0f172a',
          dark: '#0a0a0f',
          light: '#f8fafc',
        }
      },
      fontFamily: {
        game: ['"Press Start 2P"', 'system-ui'],
        display: ['system-ui', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
