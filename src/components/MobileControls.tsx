import { ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface MobileControlsProps {
  onJump: () => void
  visible: boolean
}

export function MobileControls({ onJump, visible }: MobileControlsProps) {
  if (!visible) return null
  
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none md:hidden">
      <motion.button
        onTouchStart={(e) => {
          e.preventDefault()
          onJump()
        }}
        className="pointer-events-auto w-20 h-20 rounded-full bg-game-accent/80 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-game-accent/30 active:scale-95 transition-transform"
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-10 h-10 text-white" />
      </motion.button>
    </div>
  )
}
