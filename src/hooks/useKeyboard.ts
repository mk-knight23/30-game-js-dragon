import { useEffect, useCallback, useRef } from 'react'

interface UseKeyboardOptions {
  onJump: () => void
  onPause?: () => void
  onRestart?: () => void
  enabled?: boolean
}

export function useKeyboard({ onJump, onPause, onRestart, enabled = true }: UseKeyboardOptions) {
  const keysPressed = useRef<Set<string>>(new Set())
  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return
      
      const key = e.code
      
      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'KeyW', 'Escape', 'KeyP', 'KeyR'].includes(key)) {
        e.preventDefault()
      }
      
      // Avoid key repeat
      if (keysPressed.current.has(key)) return
      keysPressed.current.add(key)
      
      // Jump keys
      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
        onJump()
      }
      
      // Pause key
      if ((key === 'Escape' || key === 'KeyP') && onPause) {
        onPause()
      }
      
      // Restart key
      if (key === 'KeyR' && onRestart) {
        onRestart()
      }
    },
    [enabled, onJump, onPause, onRestart]
  )
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.code)
  }, [])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
  
  return keysPressed
}
