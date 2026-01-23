import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Difficulty, GameSettings, HighScore } from '@/types/game'

interface GameStore {
  // Game state
  gameState: GameState
  score: number
  
  // Settings
  settings: GameSettings
  isDarkMode: boolean
  
  // High scores
  highScores: HighScore[]
  
  // Actions
  setGameState: (state: GameState) => void
  setScore: (score: number) => void
  incrementScore: () => void
  resetGame: () => void
  
  // Settings actions
  setDifficulty: (difficulty: Difficulty) => void
  toggleSound: () => void
  toggleMusic: () => void
  toggleFPS: () => void
  toggleDarkMode: () => void
  
  // High score actions
  addHighScore: (score: number, difficulty: Difficulty) => void
  getHighScore: (difficulty: Difficulty) => number
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gameState: 'idle',
      score: 0,
      
      settings: {
        difficulty: 'medium',
        soundEnabled: true,
        musicEnabled: true,
        showFPS: false,
      },
      
      isDarkMode: true,
      highScores: [],
      
      // Game state actions
      setGameState: (gameState) => set({ gameState }),
      
      setScore: (score) => set({ score }),
      
      incrementScore: () => set((state) => ({ score: state.score + 1 })),
      
      resetGame: () => set({ score: 0, gameState: 'idle' }),
      
      // Settings actions
      setDifficulty: (difficulty) => 
        set((state) => ({ 
          settings: { ...state.settings, difficulty } 
        })),
      
      toggleSound: () =>
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled }
        })),
      
      toggleMusic: () =>
        set((state) => ({
          settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled }
        })),
      
      toggleFPS: () =>
        set((state) => ({
          settings: { ...state.settings, showFPS: !state.settings.showFPS }
        })),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // High score actions
      addHighScore: (score, difficulty) => {
        const newScore: HighScore = {
          score,
          difficulty,
          date: new Date().toISOString(),
        }
        
        set((state) => {
          const filtered = state.highScores.filter(
            (hs) => hs.difficulty !== difficulty || hs.score >= score
          )
          const updated = [...filtered, newScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10) // Keep top 10 overall
          
          return { highScores: updated }
        })
      },
      
      getHighScore: (difficulty) => {
        const scores = get().highScores.filter((hs) => hs.difficulty === difficulty)
        return scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0
      },
    }),
    {
      name: 'dragon-game-storage',
      partialize: (state) => ({
        settings: state.settings,
        isDarkMode: state.isDarkMode,
        highScores: state.highScores,
      }),
    }
  )
)
