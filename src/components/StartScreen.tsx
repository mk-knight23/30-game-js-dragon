import { motion } from 'framer-motion'
import { Play, Settings, Trophy, Volume2, VolumeX, Music, Music2 } from 'lucide-react'
import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { DIFFICULTY_CONFIGS, type Difficulty } from '@/types/game'

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { 
    settings, 
    setDifficulty, 
    toggleSound, 
    toggleMusic,
    toggleFPS,
    getHighScore 
  } = useGameStore()
  
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']
  const highScore = getHighScore(settings.difficulty)
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-game-bg via-gray-900 to-black">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-game-accent/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 50 
            }}
            animate={{ 
              y: -50,
              x: Math.random() * window.innerWidth,
            }}
            transition={{ 
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-4"
      >
        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold font-game mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <span className="text-game-accent text-shadow-glow">DRAGON</span>
          <br />
          <span className="text-game-gold">RUNNER</span>
        </motion.h1>
        
        <motion.p
          className="text-gray-400 mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Jump over the dragons to survive!
        </motion.p>
        
        {/* High Score */}
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Trophy className="w-5 h-5 text-game-gold" />
            <span className="text-game-gold font-game">
              Best: {highScore} ({DIFFICULTY_CONFIGS[settings.difficulty].name})
            </span>
          </motion.div>
        )}
        
        {/* Settings Panel */}
        {showSettings ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-xl p-6 mb-6 max-w-md mx-auto"
          >
            <h3 className="text-xl font-bold text-white font-game mb-4">Settings</h3>
            
            {/* Difficulty Selection */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Difficulty</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-4 py-2 rounded-lg font-game text-sm transition-all ${
                      settings.difficulty === diff
                        ? 'bg-game-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {DIFFICULTY_CONFIGS[diff].name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sound toggles */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleSound}
                className={`p-3 rounded-lg transition-all ${
                  settings.soundEnabled 
                    ? 'bg-game-accent text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}
                title="Sound Effects"
              >
                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleMusic}
                className={`p-3 rounded-lg transition-all ${
                  settings.musicEnabled 
                    ? 'bg-game-accent text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}
                title="Music"
              >
                {settings.musicEnabled ? <Music className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Show FPS toggle */}
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showFPS}
                onChange={toggleFPS}
                className="w-4 h-4 accent-game-accent"
              />
              <span className="text-gray-300 text-sm">Show FPS</span>
            </label>
            
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 mx-auto mb-6 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.button>
        )}
        
        {/* Start Button */}
        <motion.button
          onClick={onStart}
          className="group relative px-12 py-4 bg-game-accent text-white font-bold font-game text-xl rounded-xl shadow-lg shadow-game-accent/30 hover:shadow-game-accent/50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-3">
            <Play className="w-6 h-6" />
            START GAME
          </span>
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-game-accent"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
        
        {/* Controls hint */}
        <motion.div
          className="mt-8 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">SPACE</kbd> or tap to jump</p>
          <p className="mt-1">Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">P</kbd> to pause</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
