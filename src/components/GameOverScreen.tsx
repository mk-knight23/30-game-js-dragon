import { motion } from 'framer-motion'
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { DIFFICULTY_CONFIGS } from '@/types/game'

interface GameOverScreenProps {
  onRestart: () => void
  onHome: () => void
}

export function GameOverScreen({ onRestart, onHome }: GameOverScreenProps) {
  const { score, settings, getHighScore, highScores } = useGameStore()
  const currentHighScore = getHighScore(settings.difficulty)
  const isNewHighScore = score >= currentHighScore && score > 0
  
  // Get top scores for current difficulty
  const difficultyScores = highScores
    .filter((hs) => hs.difficulty === settings.difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-game-accent/20"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Skull className="w-16 h-16 mx-auto text-game-accent mb-4" />
          </motion.div>
          
          <h2 className="text-4xl font-bold font-game text-game-accent mb-2">
            GAME OVER
          </h2>
          
          <p className="text-gray-400">
            {DIFFICULTY_CONFIGS[settings.difficulty].name} Mode
          </p>
        </div>
        
        {/* Score */}
        <div className="text-center mb-6">
          <motion.p
            className="text-6xl font-bold font-game text-white mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {score}
          </motion.p>
          
          {isNewHighScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-game-gold"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-game">NEW HIGH SCORE!</span>
              <Trophy className="w-5 h-5" />
            </motion.div>
          )}
          
          {!isNewHighScore && currentHighScore > 0 && (
            <p className="text-gray-400">
              High Score: <span className="text-game-gold">{currentHighScore}</span>
            </p>
          )}
        </div>
        
        {/* Top Scores */}
        {difficultyScores.length > 1 && (
          <div className="mb-6 bg-black/30 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-2 font-game">Top Scores</h3>
            <div className="space-y-1">
              {difficultyScores.map((hs, index) => (
                <div 
                  key={`${hs.date}-${index}`}
                  className={`flex justify-between text-sm ${
                    hs.score === score ? 'text-game-gold' : 'text-gray-300'
                  }`}
                >
                  <span>#{index + 1}</span>
                  <span className="font-mono">{hs.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex gap-4">
          <motion.button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-game hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Menu
          </motion.button>
          
          <motion.button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-game-accent text-white rounded-lg font-game hover:bg-game-accent/80 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </motion.button>
        </div>
        
        {/* Restart hint */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">R</kbd> to restart
        </p>
      </motion.div>
    </motion.div>
  )
}
