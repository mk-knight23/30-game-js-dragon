import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { DIFFICULTY_CONFIGS, type Player, type Dragon } from '@/types/game'

// Canvas dimensions
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const GROUND_HEIGHT = 50

// Sprite dimensions
const PLAYER_WIDTH = 80
const PLAYER_HEIGHT = 90
const DRAGON_WIDTH = 70
const DRAGON_HEIGHT = 60

interface GameCanvasProps {
  onGameOver: () => void
}

export function GameCanvas({ onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const fpsRef = useRef<number[]>([])
  const [currentFPS, setCurrentFPS] = useState(60)
  
  const { 
    gameState, 
    score, 
    incrementScore, 
    settings,
    setGameState 
  } = useGameStore()
  
  const config = DIFFICULTY_CONFIGS[settings.difficulty]
  
  // Game state refs (mutable during game loop)
  const playerRef = useRef<Player>({
    x: 100,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityY: 0,
    isJumping: false,
    frameIndex: 0,
    frameTimer: 0,
  })
  
  const dragonsRef = useRef<Dragon[]>([])
  const speedRef = useRef(config.baseSpeed)
  const spawnTimerRef = useRef(0)
  const backgroundXRef = useRef(0)
  const scoreTimerRef = useRef(0)
  
  // Load images
  const imagesRef = useRef<{
    background?: HTMLImageElement
    player?: HTMLImageElement
    dragon?: HTMLImageElement
  }>({})
  
  const [imagesLoaded, setImagesLoaded] = useState(false)
  
  useEffect(() => {
    let loadedCount = 0
    const totalImages = 3
    
    const onLoad = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        setImagesLoaded(true)
      }
    }
    
    const bg = new Image()
    bg.src = '/bg.png'
    bg.onload = onLoad
    imagesRef.current.background = bg
    
    const player = new Image()
    player.src = '/dino.png'
    player.onload = onLoad
    imagesRef.current.player = player
    
    const dragon = new Image()
    dragon.src = '/dragon.png'
    dragon.onload = onLoad
    imagesRef.current.dragon = dragon
  }, [])
  
  // Jump handler
  const jump = useCallback(() => {
    const player = playerRef.current
    if (!player.isJumping && gameState === 'playing') {
      player.velocityY = config.jumpForce
      player.isJumping = true
    }
  }, [gameState, config.jumpForce])
  
  // Expose jump to parent
  useEffect(() => {
    (window as { jump?: () => void }).jump = jump
  }, [jump])
  
  // Reset game state
  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 100,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocityY: 0,
      isJumping: false,
      frameIndex: 0,
      frameTimer: 0,
    }
    dragonsRef.current = []
    speedRef.current = config.baseSpeed
    spawnTimerRef.current = 0
    backgroundXRef.current = 0
    scoreTimerRef.current = 0
  }, [config.baseSpeed])
  
  // Initialize on game start
  useEffect(() => {
    if (gameState === 'playing') {
      resetGame()
    }
  }, [gameState, resetGame])
  
  // Collision detection
  const checkCollision = (player: Player, dragon: Dragon): boolean => {
    const padding = 15 // More forgiving hitbox
    return (
      player.x + padding < dragon.x + dragon.width - padding &&
      player.x + player.width - padding > dragon.x + padding &&
      player.y + padding < dragon.y + dragon.height - padding &&
      player.y + player.height - padding > dragon.y + padding
    )
  }
  
  // Spawn dragon
  const spawnDragon = () => {
    const dragon: Dragon = {
      id: Math.random().toString(36).substring(7),
      x: CANVAS_WIDTH + 50,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - DRAGON_HEIGHT - Math.random() * 20,
      width: DRAGON_WIDTH,
      height: DRAGON_HEIGHT,
      speed: speedRef.current,
      frameIndex: 0,
      frameTimer: 0,
    }
    dragonsRef.current.push(dragon)
  }
  
  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current || gameState !== 'playing') return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    // Calculate delta time
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    
    // FPS calculation
    if (settings.showFPS) {
      const fps = 1000 / deltaTime
      fpsRef.current.push(fps)
      if (fpsRef.current.length > 30) fpsRef.current.shift()
      const avgFPS = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length
      setCurrentFPS(Math.round(avgFPS))
    }
    
    const player = playerRef.current
    const dragons = dragonsRef.current
    
    // Update player physics
    player.velocityY += config.gravity
    player.y += player.velocityY
    
    // Ground collision
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT
    if (player.y >= groundY) {
      player.y = groundY
      player.velocityY = 0
      player.isJumping = false
    }
    
    // Animate player (running)
    player.frameTimer += deltaTime
    if (player.frameTimer > 100) {
      player.frameIndex = (player.frameIndex + 1) % 4
      player.frameTimer = 0
    }
    
    // Update background
    backgroundXRef.current -= speedRef.current * 0.5
    if (backgroundXRef.current <= -CANVAS_WIDTH) {
      backgroundXRef.current = 0
    }
    
    // Update speed
    speedRef.current = Math.min(
      speedRef.current + config.speedIncrement,
      config.maxSpeed
    )
    
    // Spawn dragons
    spawnTimerRef.current += deltaTime
    const currentSpawnInterval = Math.max(
      config.spawnInterval - (speedRef.current - config.baseSpeed) * 100,
      config.minSpawnInterval
    )
    
    if (spawnTimerRef.current > currentSpawnInterval) {
      spawnDragon()
      spawnTimerRef.current = 0
    }
    
    // Update dragons
    for (let i = dragons.length - 1; i >= 0; i--) {
      const dragon = dragons[i]
      dragon.x -= speedRef.current
      
      // Animate dragon
      dragon.frameTimer += deltaTime
      if (dragon.frameTimer > 150) {
        dragon.frameIndex = (dragon.frameIndex + 1) % 2
        dragon.frameTimer = 0
      }
      
      // Check collision
      if (checkCollision(player, dragon)) {
        setGameState('gameover')
        onGameOver()
        return
      }
      
      // Remove off-screen dragons
      if (dragon.x + dragon.width < 0) {
        dragons.splice(i, 1)
      }
    }
    
    // Update score
    scoreTimerRef.current += deltaTime
    if (scoreTimerRef.current > 100) {
      incrementScore()
      scoreTimerRef.current = 0
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw background (parallax scrolling)
    const bg = imagesRef.current.background
    if (bg) {
      ctx.drawImage(bg, backgroundXRef.current, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.drawImage(bg, backgroundXRef.current + CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    } else {
      // Fallback gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }
    
    // Draw ground
    ctx.fillStyle = '#2d3a4a'
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT)
    
    // Ground line
    ctx.strokeStyle = '#e94560'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.stroke()
    
    // Draw player
    const playerImg = imagesRef.current.player
    if (playerImg) {
      // Add bounce effect when jumping
      const bounceOffset = player.isJumping ? Math.sin(Date.now() / 50) * 2 : 0
      ctx.drawImage(
        playerImg,
        player.x,
        player.y + bounceOffset,
        player.width,
        player.height
      )
    } else {
      // Fallback player shape
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(player.x, player.y, player.width, player.height)
    }
    
    // Draw dragons
    const dragonImg = imagesRef.current.dragon
    for (const dragon of dragons) {
      if (dragonImg) {
        // Flip dragon to face left and add hover effect
        ctx.save()
        ctx.translate(dragon.x + dragon.width, dragon.y)
        ctx.scale(-1, 1)
        const hoverOffset = Math.sin(Date.now() / 200 + dragon.x) * 5
        ctx.drawImage(dragonImg, 0, hoverOffset, dragon.width, dragon.height)
        ctx.restore()
      } else {
        // Fallback dragon shape
        ctx.fillStyle = '#e94560'
        ctx.fillRect(dragon.x, dragon.y, dragon.width, dragon.height)
      }
    }
    
    // Draw FPS
    if (settings.showFPS) {
      ctx.fillStyle = '#f39c12'
      ctx.font = '14px Orbitron'
      ctx.fillText(`FPS: ${currentFPS}`, CANVAS_WIDTH - 80, 25)
    }
    
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, config, incrementScore, onGameOver, setGameState, settings.showFPS, currentFPS])
  
  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing' && imagesLoaded) {
      lastTimeRef.current = performance.now()
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, imagesLoaded, gameLoop])
  
  // Handle touch/click for mobile
  const handleInteraction = useCallback(() => {
    if (gameState === 'playing') {
      jump()
    }
  }, [gameState, jump])
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto rounded-lg shadow-2xl border-2 border-game-accent/30"
        style={{ 
          maxHeight: '60vh',
          aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
        }}
      />
      
      {/* Score display */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-game-gold font-bold text-xl font-game">
            Score: {score}
          </p>
        </div>
      )}
      
      {/* Pause indicator */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-white font-game mb-4">PAUSED</p>
            <p className="text-gray-300">Press P or ESC to resume</p>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-game-bg rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300 font-game">Loading assets...</p>
          </div>
        </div>
      )}
    </div>
  )
}
