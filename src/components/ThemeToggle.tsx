import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useGameStore()
  
  return (
    <motion.button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:border-game-accent transition-all"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </motion.button>
  )
}
