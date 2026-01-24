import { ref } from 'vue'
import { Howl } from 'howler'
import { useSettingsStore } from '@/stores/settings'

export function useAudio() {
  const settingsStore = useSettingsStore()
  
  const sounds = ref<{
    jump?: Howl
    score?: Howl
    crash?: Howl
    gameover?: Howl
    start?: Howl
  }>({})

  function initializeSounds(): void {
    sounds.value.jump = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
      volume: 0.3,
    })

    sounds.value.score = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
      volume: 0.2,
    })

    sounds.value.crash = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3'],
      volume: 0.5,
    })

    sounds.value.gameover = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2028/2028-preview.mp3'],
      volume: 0.5,
    })

    sounds.value.start = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'],
      volume: 0.4,
    })
  }

  function playJump(): void {
    if (settingsStore.settings.soundEnabled && sounds.value.jump) {
      sounds.value.jump.play()
    }
  }

  function playScore(): void {
    if (settingsStore.settings.soundEnabled && sounds.value.score) {
      sounds.value.score.play()
    }
  }

  function playCrash(): void {
    if (settingsStore.settings.soundEnabled && sounds.value.crash) {
      sounds.value.crash.play()
    }
  }

  function playGameOver(): void {
    if (settingsStore.settings.soundEnabled && sounds.value.gameover) {
      sounds.value.gameover.play()
    }
  }

  function playStart(): void {
    if (settingsStore.settings.soundEnabled && sounds.value.start) {
      sounds.value.start.play()
    }
  }

  function stopAll(): void {
    Object.values(sounds.value).forEach(sound => {
      if (sound) sound.stop()
    })
  }

  function destroySounds(): void {
    stopAll()
    Object.values(sounds.value).forEach(sound => {
      if (sound) sound.unload()
    })
  }

  return {
    initializeSounds,
    playJump,
    playScore,
    playCrash,
    playGameOver,
    playStart,
    stopAll,
    destroySounds,
  }
}
