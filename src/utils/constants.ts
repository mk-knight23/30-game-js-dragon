export const GAME_CONSTANTS = {
  INITIAL_SPEED: 5,
  MAX_SPEED: 15,
  MIN_SPEED: 3,
  GRAVITY: 0.8,
  JUMP_FORCE: 15,
  GROUND_Y: 350,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  PLAYER_WIDTH: 60,
  PLAYER_HEIGHT: 60,
  OBSTACLE_WIDTH: 40,
  OBSTACLE_HEIGHT: 40,
  INITIAL_LIVES: 3,
  SCORE_PER_FRAME: 1,
} as const

export const STORAGE_KEYS = {
  HIGH_SCORE: 'dragon-highscore',
  SETTINGS: 'dragon-settings',
  STATS: 'dragon-stats',
} as const

export const KEYBOARD_SHORTCUTS = {
  START: 'Space',
  PAUSE: 'Escape',
  JUMP: 'ArrowUp',
  JUMP_ALT: 'KeyW',
  SOUND: 'KeyM',
  THEME: 'KeyT',
  SETTINGS: 'KeyS',
} as const
