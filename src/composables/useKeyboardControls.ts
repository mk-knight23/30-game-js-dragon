import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { KEYBOARD_SHORTCUTS } from '@/utils/constants'

type Handler = () => void

export function useKeyboardControls() {
  const gameStore = useGameStore()
  const settingsStore = useSettingsStore()
  
  const handlers = new Map<string, Set<Handler>>()

  function registerShortcut(key: string, handler: Handler): void {
    const upperKey = key.toUpperCase()
    if (!handlers.has(upperKey)) {
      handlers.set(upperKey, new Set())
    }
    handlers.get(upperKey)!.add(handler)
  }

  function handleKeydown(event: KeyboardEvent): void {
    const key = event.code

    if (key === KEYBOARD_SHORTCUTS.JUMP || key === KEYBOARD_SHORTCUTS.JUMP_ALT) {
      event.preventDefault()
      if (gameStore.isPlaying && event.type === 'keydown') {
        if (typeof (globalThis as any).handleJump === 'function') {
          (globalThis as any).handleJump()
        }
      }
      return
    }

    const handlersForKey = handlers.get(key)
    if (handlersForKey && handlersForKey.size > 0) {
      event.preventDefault()
      handlersForKey.forEach(handler => handler())
    }
  }

  function initialize(): void {
    document.addEventListener('keydown', handleKeydown)
    
    registerShortcut(KEYBOARD_SHORTCUTS.START, () => {
      if (gameStore.isIdle || gameStore.isGameOver) {
        gameStore.startGame()
      }
    })

    registerShortcut(KEYBOARD_SHORTCUTS.PAUSE, () => {
      if (gameStore.isPlaying || gameStore.isPaused) {
        gameStore.pauseGame()
      }
    })

    registerShortcut(KEYBOARD_SHORTCUTS.SOUND, () => {
      settingsStore.toggleSound()
    })

    registerShortcut(KEYBOARD_SHORTCUTS.THEME, () => {
      const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system']
      const currentIndex = themes.indexOf(settingsStore.settings.theme)
      const nextIndex = (currentIndex + 1) % themes.length
      settingsStore.setTheme(themes[nextIndex])
    })
  }

  function destroy(): void {
    document.removeEventListener('keydown', handleKeydown)
    handlers.clear()
  }

  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    registerShortcut,
    initialize,
    destroy,
  }
}
