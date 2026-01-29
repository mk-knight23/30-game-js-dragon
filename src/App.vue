<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { useAudio } from '@/composables/useAudio'
import { 
  Trophy, 
  Zap,
  Activity,
  Github,
  ChevronUp,
  Moon,
  Sun,
  Settings,
  HelpCircle,
} from 'lucide-vue-next'
import SettingsPanel from '@/components/ui/SettingsPanel.vue'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()
useKeyboardControls()
const audio = useAudio()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const player = ref({ y: 0, velocity: 0, width: 60, height: 60 })
const playerTrail = ref<Array<{ y: number; alpha: number }>>([])
const obstacles = ref<Array<{ x: number; width: number; height: number; warning?: boolean }>>([])
const parallaxOffsets = ref([0, 0, 0, 0])
const scorePopups = ref<Array<{ x: number; y: number; value: number; life: number }>>([])

// V2: Collectible coins system
const coins = ref<Array<{ x: number; y: number; collected: boolean; value: number }>>([])
const coinRotation = ref(0)

let animationId: number | null = null
let isJumping = false
let jumpCount = 0
const maxJumps = 2 // Double jump enabled

const isMobile = ref(false)
const showSettings = ref(false)
const showHelp = ref(false)

const backgroundClass = computed(() => {
  if (gameStore.isGameOver) return 'bg-red-950/20'
  if (gameStore.isPaused) return 'bg-amber-950/20'
  return 'bg-jurassic-sky'
})

const themeIcon = computed(() => {
  const theme = settingsStore.settings.theme
  if (theme === 'dark') return Moon
  if (theme === 'light') return Sun
  return Sun
})

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  settingsStore.initializeTheme()
  audio.initializeSounds()
  
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()
  }
  
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

watch(() => gameStore.status, (newStatus) => {
  if (newStatus === 'playing') {
    startGame()
  } else {
    stopGame()
  }
})

function jump(): void {
  if (gameStore.status !== 'playing') return

  // Allow jumping if on ground OR haven't used all jumps yet
  if (!isJumping || jumpCount < maxJumps - 1) {
    if (!isJumping) {
      jumpCount = 1
    } else {
      jumpCount++
    }
    isJumping = true
    // Higher velocity for double jump
    player.value.velocity = jumpCount === 1 ? 15 : 12
    audio.playJump()
  }
}

function startGame(): void {
  audio.playStart()
  gameStore.startGame()
  obstacles.value = []
  coins.value = []
  player.value.y = 0
  player.value.velocity = 0
  isJumping = false
  jumpCount = 0
  gameLoop()
}

function stopGame(): void {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function gameLoop(): void {
  if (gameStore.status !== 'playing') return

  player.value.y += player.value.velocity
  player.value.velocity -= 0.8

  if (player.value.y <= 0) {
    player.value.y = 0
    player.value.velocity = 0
    isJumping = false
    jumpCount = 0
  }

  // Add player position to trail
  if (player.value.y > 5 || isJumping) {
    playerTrail.value.unshift({ y: player.value.y, alpha: 0.6 })
    // Limit trail length
    if (playerTrail.value.length > 5) {
      playerTrail.value.pop()
    }
  }

  parallaxOffsets.value = parallaxOffsets.value.map((o, i) => 
    (o - gameStore.speed * (i + 1) * 0.2) % 800
  )

  if (Math.random() < 0.02 + (gameStore.level * 0.002)) {
    const height = 30 + Math.random() * 40
    const width = 30 + Math.random() * 30
    // Add obstacle with warning flag
    obstacles.value.push({
      x: 850, // Start off-screen with warning
      width: width,
      height: height,
      warning: true // Show warning first
    })
    
    // V2: Chance to spawn a coin above the obstacle
    if (Math.random() < 0.4) {
      coins.value.push({
        x: 850 + width / 2,
        y: height + 40 + Math.random() * 60, // Above the obstacle
        collected: false,
        value: 50
      })
    }
  }

  obstacles.value.forEach((obs) => {
    obs.x -= gameStore.speed

    // Remove warning when obstacle reaches screen edge
    if (obs.warning && obs.x < 780) {
      obs.warning = false
    }

    // Only check collision for non-warning obstacles
    if (!obs.warning && obs.x < 100 + player.value.width && obs.x + obs.width > 100 &&
        player.value.y < obs.height) {
      audio.playCrash()
      gameStore.loseLife()
      obstacles.value = obstacles.value.filter(o => o !== obs)

      if (gameStore.lives <= 0) {
        audio.playGameOver()
        stopGame()
        return
      }
    }
  })

  obstacles.value = obstacles.value.filter(o => o.x > -100)
  
  // V2: Update and check coin collisions
  coinRotation.value += 0.1
  coins.value.forEach((coin) => {
    if (coin.collected) return
    coin.x -= gameStore.speed
    
    // Check collision with player
    const playerBottom = 350 - player.value.y
    const playerTop = playerBottom - player.value.height
    const playerRight = 100 + player.value.width
    const playerLeft = 100
    
    const coinBottom = 350 - coin.y
    const coinTop = coinBottom - 20
    const coinRight = coin.x + 15
    const coinLeft = coin.x - 15
    
    if (playerRight > coinLeft && playerLeft < coinRight &&
        playerBottom > coinTop && playerTop < coinBottom) {
      coin.collected = true
      gameStore.incrementScore(coin.value)
      scorePopups.value.push({
        x: coin.x,
        y: 350 - coin.y - 30,
        value: coin.value,
        life: 1
      })
    }
  })
  coins.value = coins.value.filter(c => c.x > -50 && !c.collected)

  gameStore.incrementScore(1)

  // Spawn score popup every 100 points
  if (gameStore.score > 0 && gameStore.score % 100 === 0) {
    scorePopups.value.push({
      x: 100 + player.value.width / 2,
      y: 350 - player.value.y - 80,
      value: 100,
      life: 1
    })
  }

  // Update score popups
  scorePopups.value = scorePopups.value.filter(popup => {
    popup.y -= 1
    popup.life -= 0.02
    return popup.life > 0
  })

  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function draw(): void {
  if (!ctx || !canvasRef.value) return
  const canvas = canvasRef.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const groundY = 350

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, groundY, canvas.width, 50)

  if (settingsStore.settings.showParticles) {
    parallaxOffsets.value.forEach((offset, i) => {
      ctx!.fillStyle = `rgba(255, 255, 255, ${0.05 - (i * 0.01)})`
      for (let x = offset; x < canvas.width; x += 100 * (i + 1)) {
        ctx!.fillRect(x, groundY - 20 - (i * 30), 2, 50 * (i + 1))
      }
    })
  }

  ctx.shadowBlur = 20
  ctx.shadowColor = '#39ff14'

  // Draw player trail
  playerTrail.value.forEach((trail, index) => {
    const scale = 1 - (index * 0.15)
    const offsetX = (player.value.width * (1 - scale)) / 2
    ctx!.globalAlpha = trail.alpha * 0.5
    ctx!.fillStyle = '#39ff14'
    ctx!.shadowBlur = 10
    ctx!.fillRect(
      100 + offsetX,
      groundY - trail.y - player.value.height * scale,
      player.value.width * scale,
      player.value.height * scale
    )
    // Fade trail
    trail.alpha -= 0.05
  })
  playerTrail.value = playerTrail.value.filter(t => t.alpha > 0)

  // Draw player
  ctx.globalAlpha = 1
  ctx.fillStyle = '#39ff14'
  ctx.fillRect(100, groundY - player.value.y - player.value.height, player.value.width, player.value.height)
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1

  ctx.shadowColor = '#ef4444'
  ctx.fillStyle = '#ef4444'
  obstacles.value.forEach(obs => {
    if (obs.warning) {
      // Draw warning indicator at right edge
      const alpha = 0.3 + Math.sin(Date.now() / 100) * 0.2
      ctx!.globalAlpha = alpha
      ctx!.fillStyle = '#fbbf24'
      ctx!.shadowColor = '#fbbf24'
      ctx!.shadowBlur = 15
      // Warning triangle at right edge
      ctx!.beginPath()
      ctx!.moveTo(canvas.width - 30, groundY - obs.height - 10)
      ctx!.lineTo(canvas.width - 10, groundY - obs.height / 2)
      ctx!.lineTo(canvas.width - 30, groundY)
      ctx!.closePath()
      ctx!.fill()
      ctx!.globalAlpha = 1
    } else {
      ctx!.fillStyle = '#ef4444'
      ctx!.shadowColor = '#ef4444'
      ctx!.shadowBlur = 15
      ctx!.fillRect(obs.x, groundY - obs.height, obs.width, obs.height)
    }
  })
  ctx.shadowBlur = 0

  // Draw score popups
  scorePopups.value.forEach(popup => {
    const alpha = popup.life
    ctx!.globalAlpha = alpha
    ctx!.fillStyle = '#39ff14'
    ctx!.shadowColor = '#39ff14'
    ctx!.shadowBlur = 10
    ctx!.font = 'bold 16px monospace'
    ctx!.textAlign = 'center'
    ctx!.fillText(`+${popup.value}`, popup.x, popup.y)
    ctx!.globalAlpha = 1
    ctx!.shadowBlur = 0
  })
  
  // V2: Draw coins
  coins.value.forEach(coin => {
    if (coin.collected) return
    const scale = 0.8 + Math.sin(coinRotation.value) * 0.2 // Simulate rotation
    const coinY = 350 - coin.y
    
    ctx!.globalAlpha = 1
    ctx!.fillStyle = '#fbbf24'
    ctx!.shadowColor = '#fbbf24'
    ctx!.shadowBlur = 15
    
    // Draw coin as ellipse (rotating effect)
    ctx!.beginPath()
    ctx!.ellipse(coin.x, coinY, 12 * scale, 15, 0, 0, Math.PI * 2)
    ctx!.fill()
    
    // Inner detail
    ctx!.fillStyle = '#f59e0b'
    ctx!.beginPath()
    ctx!.ellipse(coin.x, coinY, 8 * scale, 10, 0, 0, Math.PI * 2)
    ctx!.fill()
    
    ctx!.shadowBlur = 0
  })
}

function toggleTheme(): void {
  const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system']
  const currentIndex = themes.indexOf(settingsStore.settings.theme)
  const nextIndex = (currentIndex + 1) % themes.length
  settingsStore.setTheme(themes[nextIndex])
}

;(globalThis as any).handleJump = jump
</script>

<template>
  <div 
    class="h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-500"
    :class="backgroundClass"
    role="application"
    aria-label="Dragon Surge Game"
  >
    <div class="absolute inset-0 z-0">
      <div v-for="(offset, i) in parallaxOffsets" :key="i"
           class="parallax-layer opacity-20"
           :style="{ 
             backgroundPositionX: offset + 'px', 
             backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%)',
             backgroundSize: (100 * (i + 1)) + 'px 100%' 
           }">
      </div>
    </div>

    <nav class="h-20 lg:h-24 border-b border-white/5 px-7 lg:px-11 flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
      <div class="flex items-center space-x-3 text-white">
        <div class="bg-jurassic-glow p-2 rounded-xl rotate-3 shadow-lg shadow-jurassic-glow/20">
          <Zap class="text-black" :size="20" lg:size="24" fill="currentColor" />
        </div>
        <h1 class="text-xl lg:text-2xl font-display font-black tracking-tighter uppercase italic">
          Dragon<span class="text-jurassic-glow">Surge</span>
        </h1>
      </div>

      <div class="flex items-center space-x-4 lg:space-x-6 text-white">
        <div class="hidden lg:flex items-center space-x-4">
          <div v-for="i in 3" :key="i"
               class="w-2 h-2 rounded-full transition-colors"
               :class="i <= gameStore.lives ? 'bg-jurassic-glow' : 'bg-white/20'">
          </div>
        </div>
        
        <div class="glass-panel px-4 lg:px-6 py-2 lg:py-2.5 flex items-center space-x-3 lg:space-x-4">
          <Trophy :size="14" lg:size="16" class="text-amber-500" />
          <span class="text-[10px] lg:text-xs font-black tracking-widest uppercase">Apex: {{ gameStore.highScore }}m</span>
        </div>

        <div class="flex gap-1 lg:gap-2">
          <button 
            @click="toggleTheme"
            class="p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-colors"
            :aria-label="`Toggle theme. Current: ${settingsStore.settings.theme}`"
          >
            <component :is="themeIcon" :size="16" lg:size="20" class="text-white" />
          </button>
          
          <button 
            @click="showSettings = true"
            class="p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Open settings"
          >
            <Settings :size="16" lg:size="20" class="text-white" />
          </button>
          
          <button 
            @click="showHelp = true"
            class="p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Open help"
          >
            <HelpCircle :size="16" lg:size="20" class="text-white" />
          </button>
        </div>

        <a href="https://github.com/mk-knight23/33-Dragon-Game-JS" target="_blank" 
           class="p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white hidden lg:block">
          <Github :size="20" />
        </a>
      </div>
    </nav>

    <main class="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
      <div class="relative glass-panel p-3 lg:p-4 border-2 border-white/10 shadow-[0_0_100px_rgba(251,191,36,0.05)]">
        <canvas
          ref="canvasRef"
          width="800"
          height="400"
          class="bg-black/40 rounded-xl w-full max-w-[802px] h-auto"
          role="img"
          aria-label="Dragon game canvas"
        ></canvas>
        
        <div v-if="gameStore.isIdle" 
             class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl space-y-6 lg:space-y-8">
          <div class="text-center space-y-2">
            <h2 class="text-3xl lg:text-4xl font-display font-black uppercase text-white tracking-tighter leading-none italic">
              Initiate <br/> Sequence
            </h2>
            <p class="text-[10px] lg:text-xs font-black uppercase text-slate-500 tracking-[0.2em] lg:tracking-[0.3em]">
              Neural Link Stable
            </p>
          </div>
          <button 
            @click="startGame"
            class="btn-primary pointer-events-auto"
            autofocus
          >
            Execute Run
          </button>
        </div>

        <div v-if="gameStore.isPaused" 
             class="absolute inset-0 flex flex-col items-center justify-center bg-amber-950/60 backdrop-blur-md rounded-2xl space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl lg:text-4xl font-display font-black text-amber-500 tracking-tighter italic uppercase leading-none">
              Paused
            </h2>
          </div>
          <button 
            @click="gameStore.pauseGame()"
            class="px-8 py-3 lg:py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs lg:text-sm hover:bg-jurassic-glow transition-all"
          >
            Resume
          </button>
        </div>

        <div v-if="gameStore.isGameOver" 
             class="absolute inset-0 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-md rounded-2xl space-y-4 lg:space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl lg:text-5xl font-display font-black text-red-500 tracking-tighter italic uppercase leading-none">
              Fractured
            </h2>
            <p class="text-xs lg:text-sm font-black uppercase text-white tracking-widest">
              Final Data Chunk: {{ gameStore.score }}m
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-3 lg:gap-4">
            <div class="glass-panel p-3 lg:p-4">
              <p class="text-[8px] uppercase tracking-widest text-slate-500">Best</p>
              <p class="text-lg lg:text-xl font-game text-white">{{ gameStore.highScore }}m</p>
            </div>
            <div class="glass-panel p-3 lg:p-4">
              <p class="text-[8px] uppercase tracking-widest text-slate-500">Level</p>
              <p class="text-lg lg:text-xl font-game text-jurassic-glow">{{ gameStore.level }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-2 w-full max-w-xs">
            <button 
              @click="startGame"
              class="w-full bg-white text-black py-3 lg:py-4 rounded-xl font-bold uppercase tracking-widest text-xs lg:text-sm hover:bg-jurassic-glow transition-all"
            >
              Reset Matrix
            </button>
          </div>
        </div>

        <div v-if="gameStore.isPlaying && settingsStore.settings.showHUD" 
             class="absolute top-4 lg:top-8 left-4 lg:left-8 p-3 lg:p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/5 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <Activity :size="14" class="text-jurassic-glow" />
            <span class="text-[8px] lg:text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Signal Depth
            </span>
          </div>
          <span class="text-xl lg:text-2xl font-mono font-black text-jurassic-glow tracking-tighter">
            {{ gameStore.formattedScore }}
          </span>
        </div>
      </div>

      <div v-if="gameStore.isPlaying" class="mt-8 lg:mt-12 md:hidden">
        <button 
          @touchstart.prevent="jump"
          @click="jump"
          class="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-white active:bg-jurassic-glow transition-all pointer-events-auto"
          aria-label="Jump"
        >
          <ChevronUp :size="32" />
        </button>
      </div>
    </main>

    <footer class="h-16 lg:h-20 border-t border-white/5 px-6 lg:px-10 flex items-center justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] text-slate-700 italic">
      <div class="flex items-center space-x-4 lg:space-x-6">
        <span class="flex items-center gap-2">
          <Activity :size="10" lg:size="12" /> Engine: Reactive-Vue
        </span>
        <span class="w-1 h-1 bg-slate-800 rounded-full hidden lg:block"></span>
        <span class="hidden lg:block">Core v2.0-Production</span>
      </div>
      <p>© 2026 Made by MK — Built by Musharraf Kazi</p>
    </footer>

    <SettingsPanel v-model:show="showSettings" v-model:showHelp="showHelp" />
  </div>
</template>
