import { useCallback, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { GameCanvas } from '@/components/GameCanvas'
import { StartScreen } from '@/components/StartScreen'
import { GameOverScreen } from '@/components/GameOverScreen'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MobileControls } from '@/components/MobileControls'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAudio } from '@/hooks/useAudio'

function App() {
  const { 
    gameState, 
    setGameState, 
    score, 
    setScore,
    settings, 
    isDarkMode,
    addHighScore,
  } = useGameStore()
  
  const { playMusic, stopMusic, playGameOver } = useAudio()
  
  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setGameState('playing')
    playMusic()
  }, [setScore, setGameState, playMusic])
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    stopMusic()
    playGameOver()
    addHighScore(score, settings.difficulty)
  }, [stopMusic, playGameOver, addHighScore, score, settings.difficulty])
  
  // Restart game
  const restartGame = useCallback(() => {
    setScore(0)
    setGameState('playing')
    playMusic()
  }, [setScore, setGameState, playMusic])
  
  // Go to home
  const goHome = useCallback(() => {
    setScore(0)
    setGameState('idle')
  }, [setScore, setGameState])
  
  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused')
    } else if (gameState === 'paused') {
      setGameState('playing')
    }
  }, [gameState, setGameState])
  
  // Jump handler
  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      // Access the global jump function exposed by GameCanvas
      const win = window as { jump?: () => void }
      if (win.jump) {
        win.jump()
      }
    } else if (gameState === 'idle') {
      startGame()
    }
  }, [gameState, startGame])
  
  // Handle restart from game over
  const handleRestart = useCallback(() => {
    if (gameState === 'gameover') {
      restartGame()
    }
  }, [gameState, restartGame])
  
  // Keyboard controls
  useKeyboard({
    onJump: handleJump,
    onPause: togglePause,
    onRestart: handleRestart,
    enabled: true,
  })
  
  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])
  
  return (
    <div className={`min-h-screen bg-game-bg transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="relative w-full h-screen flex flex-col items-center justify-center p-4">
        {/* Theme toggle */}
        <ThemeToggle />
        
        {/* Title (visible during game) */}
        {gameState !== 'idle' && (
          <h1 className="absolute top-4 left-4 text-xl font-bold font-game text-game-accent">
            Dragon Runner
          </h1>
        )}
        
        {/* Game canvas */}
        <GameCanvas onGameOver={handleGameOver} />
        
        {/* Start screen overlay */}
        {gameState === 'idle' && (
          <StartScreen onStart={startGame} />
        )}
        
        {/* Game over overlay */}
        {gameState === 'gameover' && (
          <GameOverScreen onRestart={restartGame} onHome={goHome} />
        )}
        
        {/* Mobile controls */}
        <MobileControls 
          onJump={handleJump} 
          visible={gameState === 'playing'} 
        />
        
        {/* Footer */}
        <div className="absolute bottom-4 text-center text-gray-600 text-xs">
          <p>
            Built with React + TypeScript + Tailwind
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
