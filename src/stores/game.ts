import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameStatus } from '@/types'
import { STORAGE_KEYS, GAME_CONSTANTS } from '@/utils/constants'

export const useGameStore = defineStore('game', () => {
  const status = ref<GameStatus>('idle')
  const score = ref(0)
  const highScore = ref(parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0'))
  const speed = ref<number>(GAME_CONSTANTS.INITIAL_SPEED)
  const lives = ref<number>(GAME_CONSTANTS.INITIAL_LIVES)
  const level = ref(1)

  const isPlaying = computed(() => status.value === 'playing')
  const isGameOver = computed(() => status.value === 'gameover')
  const isIdle = computed(() => status.value === 'idle')
  const isPaused = computed(() => status.value === 'paused')

  const formattedScore = computed(() => `${score.value}m`)

  function startGame(): void {
    status.value = 'playing'
    score.value = 0
    speed.value = GAME_CONSTANTS.INITIAL_SPEED
    lives.value = GAME_CONSTANTS.INITIAL_LIVES
    level.value = 1
  }

  function pauseGame(): void {
    status.value = status.value === 'paused' ? 'playing' : 'paused'
  }

  function gameOver(): void {
    status.value = 'gameover'
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.value.toString())
    }
  }

  function resetGame(): void {
    status.value = 'idle'
    score.value = 0
    speed.value = GAME_CONSTANTS.INITIAL_SPEED
    lives.value = GAME_CONSTANTS.INITIAL_LIVES
    level.value = 1
  }

  function incrementScore(points: number): void {
    score.value += points
    
    const newLevel = Math.floor(score.value / 1000) + 1
    if (newLevel > level.value) {
      level.value = newLevel
      speed.value = Math.min(GAME_CONSTANTS.MAX_SPEED, GAME_CONSTANTS.INITIAL_SPEED + (level.value - 1) * 0.5)
    }
  }

  function loseLife(): void {
    lives.value--
    if (lives.value <= 0) {
      gameOver()
    }
  }

  function setSpeed(newSpeed: number): void {
    speed.value = Math.max(GAME_CONSTANTS.MIN_SPEED, Math.min(GAME_CONSTANTS.MAX_SPEED, newSpeed))
  }

  return {
    status,
    score,
    highScore,
    speed,
    lives,
    level,
    isPlaying,
    isGameOver,
    isIdle,
    isPaused,
    formattedScore,
    startGame,
    pauseGame,
    gameOver,
    resetGame,
    incrementScore,
    loseLife,
    setSpeed,
  }
})
