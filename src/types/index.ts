export interface GameState {
  status: 'idle' | 'playing' | 'gameover' | 'paused'
  score: number
  highScore: number
  speed: number
  lives: number
  level: number
}

export interface SettingsState {
  soundEnabled: boolean
  musicEnabled: boolean
  vibrationsEnabled: boolean
  difficulty: 'easy' | 'normal' | 'hard'
  theme: 'dark' | 'light' | 'system'
  showParticles: boolean
  showHUD: boolean
}

export interface StatsState {
  totalGames: number
  totalDistance: number
  totalObstacles: number
  bestScore: number
  averageScore: number
  longestRun: number
  lastPlayed: string | null
}

export type GameStatus = GameState['status']
