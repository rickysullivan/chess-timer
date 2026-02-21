export const PRESETS = [
  { id: '1+0', label: '1+0', description: 'Bullet', baseMinutes: 1, incrementSeconds: 0, delaySeconds: 0 },
  { id: '3+2', label: '3+2', description: 'Blitz', baseMinutes: 3, incrementSeconds: 2, delaySeconds: 0 },
  { id: '5+0', label: '5+0', description: 'Blitz', baseMinutes: 5, incrementSeconds: 0, delaySeconds: 0 },
  { id: '10+0', label: '10+0', description: 'Rapid', baseMinutes: 10, incrementSeconds: 0, delaySeconds: 0 },
  {
    id: '15+10',
    label: '15+10',
    description: 'Rapid +',
    baseMinutes: 15,
    incrementSeconds: 10,
    delaySeconds: 0,
  },
  { id: '30+0', label: '30+0', description: 'Classical', baseMinutes: 30, incrementSeconds: 0, delaySeconds: 0 },
] as const

export type ControlSource = 'preset' | 'custom'
export type Side = 'White' | 'Black'
export type LayoutMode = 'adaptive' | 'classic'

export type TimeControl = {
  label: string
  baseMinutes: number
  incrementSeconds: number
  delaySeconds: number
  source: ControlSource
}

export type AppSettings = {
  sound: boolean
  vibration: boolean
  keepScreenAwake: boolean
  layoutMode: LayoutMode
  highContrastMode: boolean
  largeDigitsMode: boolean
}

export type LastUsedControl = {
  source: ControlSource
  presetId: string
  customBaseMinutes: string
  customIncrementSeconds: string
  customDelaySeconds: string
}

export type ActionMessageTone = 'success' | 'error' | 'info'

export type TurnSnapshot = {
  activeSide: Side
  remainingMs: Record<Side, number>
  activeDelayRemainingMs: number
  isPaused: boolean
  timeoutSide: Side | null
}

export const STORAGE_KEYS = {
  settings: 'chess_timer.settings',
  lastUsedControl: 'chess_timer.last_used_control',
  gameState: 'chess_timer.game_state',
  sessionId: 'chess_timer.session_id',
  onboardingSeen: 'chess_timer.onboarding_seen',
} as const

export const DEFAULT_SETTINGS: AppSettings = {
  sound: true,
  vibration: true,
  keepScreenAwake: false,
  layoutMode: 'adaptive',
  highContrastMode: false,
  largeDigitsMode: false,
}

export const DEFAULT_LAST_USED_CONTROL: LastUsedControl = {
  source: 'preset',
  presetId: PRESETS[0].id,
  customBaseMinutes: '',
  customIncrementSeconds: '0',
  customDelaySeconds: '0',
}

export const formatMs = (value: number) => {
  const safeValue = Math.max(0, value)
  const totalSeconds = Math.ceil(safeValue / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const parseNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}
