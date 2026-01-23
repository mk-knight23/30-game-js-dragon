# Dragon Runner

A modern endless runner game where you play as a dinosaur jumping over incoming dragons. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Smooth 60fps Gameplay** - Canvas-based rendering with optimized game loop
- **4 Difficulty Levels** - Easy, Medium, Hard, and Extreme modes
- **Parallax Scrolling** - Beautiful layered background effect
- **Progressive Difficulty** - Speed increases as you survive longer
- **High Score Tracking** - Persistent leaderboard per difficulty
- **Audio Support** - Background music and sound effects
- **Mobile Responsive** - Touch controls for mobile devices
- **Dark/Light Mode** - Toggle between themes
- **Pause Support** - Pause game with P or ESC key

## Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Jump | `SPACE` / `↑` / `W` | Tap screen / Jump button |
| Pause | `P` / `ESC` | - |
| Restart | `R` | Tap "Play Again" |

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management with persistence
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/mk-knight23/33-Dragon-Game-JS.git

# Navigate to project
cd 33-Dragon-Game-JS

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
33-Dragon-Game-JS/
├── public/
│   ├── bg.png           # Background image
│   ├── dino.png         # Player sprite
│   ├── dragon.png       # Enemy sprite
│   ├── music.mp3        # Background music
│   ├── gameover.mp3     # Game over sound
│   └── favicon.svg      # Site icon
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx      # Main game canvas & loop
│   │   ├── StartScreen.tsx     # Title screen
│   │   ├── GameOverScreen.tsx  # Game over modal
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── MobileControls.tsx  # Touch controls
│   ├── hooks/
│   │   ├── useKeyboard.ts      # Keyboard input handler
│   │   └── useAudio.ts         # Audio management
│   ├── stores/
│   │   └── gameStore.ts        # Zustand state store
│   ├── types/
│   │   └── game.ts             # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Game Mechanics

### Difficulty Settings

| Level | Base Speed | Max Speed | Spawn Rate |
|-------|------------|-----------|------------|
| Easy | 4 | 10 | 2.5s |
| Medium | 6 | 14 | 2.0s |
| Hard | 8 | 18 | 1.5s |
| Extreme | 10 | 24 | 1.2s |

### Scoring

- Score increases every 100ms while alive
- High scores are saved per difficulty level
- Top 10 scores displayed on game over

## Deployment

This project includes GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to `main` branch to trigger deployment

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo:** [https://mk-knight23.github.io/33-Dragon-Game-JS/](https://mk-knight23.github.io/33-Dragon-Game-JS/)
