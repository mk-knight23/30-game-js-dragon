import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StatsState } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<StatsState>({
    totalGames: 0,
    totalDistance: 0,
    totalObstacles: 0,
    bestScore: 0,
    averageScore: 0,
    longestRun: 0,
    lastPlayed: null,
  })

  function loadStats(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        stats.value = { ...stats.value, ...parsed }
      } catch {
        console.warn('Failed to parse stats')
      }
    }
  }

  function saveStats(): void {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats.value))
  }

  function recordGame(score: number, obstaclesCleared: number): void {
    stats.value.totalGames++
    stats.value.lastPlayed = new Date().toISOString()
    stats.value.totalDistance += score
    stats.value.totalObstacles += obstaclesCleared
    
    if (score > stats.value.bestScore) {
      stats.value.bestScore = score
    }
    
    if (score > stats.value.longestRun) {
      stats.value.longestRun = score
    }
    
    const totalScore = (stats.value.averageScore * (stats.value.totalGames - 1)) + score
    stats.value.averageScore = Math.round(totalScore / stats.value.totalGames)
    
    saveStats()
  }

  function resetStats(): void {
    stats.value = {
      totalGames: 0,
      totalDistance: 0,
      totalObstacles: 0,
      bestScore: 0,
      averageScore: 0,
      longestRun: 0,
      lastPlayed: null,
    }
    localStorage.removeItem(STORAGE_KEYS.STATS)
  }

  return {
    stats,
    loadStats,
    saveStats,
    recordGame,
    resetStats,
  }
})
