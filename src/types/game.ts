export type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export interface DifficultyConfig {
  name: string
  baseSpeed: number
  speedIncrement: number
  maxSpeed: number
  spawnInterval: number
  minSpawnInterval: number
  jumpForce: number
  gravity: number
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    baseSpeed: 4,
    speedIncrement: 0.002,
    maxSpeed: 10,
    spawnInterval: 2500,
    minSpawnInterval: 1500,
    jumpForce: -14,
    gravity: 0.6,
  },
  medium: {
    name: 'Medium',
    baseSpeed: 6,
    speedIncrement: 0.003,
    maxSpeed: 14,
    spawnInterval: 2000,
    minSpawnInterval: 1200,
    jumpForce: -15,
    gravity: 0.7,
  },
  hard: {
    name: 'Hard',
    baseSpeed: 8,
    speedIncrement: 0.004,
    maxSpeed: 18,
    spawnInterval: 1500,
    minSpawnInterval: 900,
    jumpForce: -16,
    gravity: 0.8,
  },
  extreme: {
    name: 'Extreme',
    baseSpeed: 10,
    speedIncrement: 0.005,
    maxSpeed: 24,
    spawnInterval: 1200,
    minSpawnInterval: 600,
    jumpForce: -18,
    gravity: 0.9,
  },
}

export interface Player {
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  isJumping: boolean
  frameIndex: number
  frameTimer: number
}

export interface Dragon {
  id: string
  x: number
  y: number
  width: number
  height: number
  speed: number
  frameIndex: number
  frameTimer: number
}

export interface GameSettings {
  difficulty: Difficulty
  soundEnabled: boolean
  musicEnabled: boolean
  showFPS: boolean
}

export interface HighScore {
  score: number
  difficulty: Difficulty
  date: string
}
