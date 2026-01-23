import { useRef, useCallback, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'

export function useAudio() {
  const { settings } = useGameStore()
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const gameoverRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio elements
  useEffect(() => {
    musicRef.current = new Audio('/music.mp3')
    musicRef.current.loop = true
    musicRef.current.volume = 0.3
    
    gameoverRef.current = new Audio('/gameover.mp3')
    gameoverRef.current.volume = 0.5
    
    return () => {
      if (musicRef.current) {
        musicRef.current.pause()
        musicRef.current = null
      }
      if (gameoverRef.current) {
        gameoverRef.current.pause()
        gameoverRef.current = null
      }
    }
  }, [])
  
  const playMusic = useCallback(() => {
    if (settings.musicEnabled && musicRef.current) {
      musicRef.current.currentTime = 0
      musicRef.current.play().catch(() => {
        // Autoplay blocked - will play on user interaction
      })
    }
  }, [settings.musicEnabled])
  
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.currentTime = 0
    }
  }, [])
  
  const playGameOver = useCallback(() => {
    if (settings.soundEnabled && gameoverRef.current) {
      gameoverRef.current.currentTime = 0
      gameoverRef.current.play().catch(() => {})
    }
  }, [settings.soundEnabled])
  
  // Handle music enable/disable
  useEffect(() => {
    if (!settings.musicEnabled && musicRef.current) {
      musicRef.current.pause()
    }
  }, [settings.musicEnabled])
  
  return {
    playMusic,
    stopMusic,
    playGameOver,
  }
}
