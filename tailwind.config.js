/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        game: { bg: '#1a1a2e', accent: '#e94560', gold: '#f39c12' }
      },
      fontFamily: { game: ['Orbitron', 'monospace'] },
    },
  },
  plugins: [],
}
