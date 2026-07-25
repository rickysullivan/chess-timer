import { create } from 'zustand'
import {
  DEFAULT_LAST_USED_CONTROL,
  DEFAULT_SETTINGS,
  PRESETS,
  STORAGE_KEYS,
  type AppSettings,
  type ControlSource,
  type LastUsedControl,
  type Side,
  type TimeControl,
  type TurnSnapshot,
} from '@/app/types'

type SetupTouched = {
  base: boolean
  increment: boolean
}

type AppStore = {
  phase: 'setup' | 'started'
  controlSource: ControlSource
  selectedPreset: string
  customBaseMinutes: string
  customIncrementSeconds: string
  touched: SetupTouched
  attemptedStart: boolean
  startedControl: TimeControl | null
  activeSide: Side
  remainingMs: Record<Side, number>
  isPaused: boolean
  timeoutSide: Side | null
  undoHistory: TurnSnapshot[]
  settings: AppSettings
  onboardingSeen: boolean
  setControlSource: (source: ControlSource) => void
  setSelectedPreset: (presetId: string) => void
  setCustomBaseMinutes: (value: string) => void
  setCustomIncrementSeconds: (value: string) => void
  setTouched: (next: Partial<SetupTouched>) => void
  setAttemptedStart: (value: boolean) => void
  startGame: (control: TimeControl) => void
  tickActiveClock: (elapsedMs: number) => void
  passTurn: () => { fromSide: Side; toSide: Side } | null
  pauseGame: () => void
  resumeGame: () => void
  togglePause: () => void
  undoTurn: () => boolean
  resetGame: () => void
  backToSetup: () => void
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  setOnboardingSeen: (value: boolean) => void
  persistGameState: () => void
  restorePersistedGameState: () => 'restored' | 'expired' | 'missing' | 'invalid'
}

type PersistedGameState = {
  phase: 'started'
  activeSide: Side
  remainingMs: Record<Side, number>
  isPaused: boolean
  timeoutSide: Side | null
  startedControl: TimeControl
  layoutMode: AppSettings['layoutMode']
  last_updated: number
}

const GAME_STATE_MAX_AGE_MS = 30 * 60 * 1000

const readStorageItem = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return null
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

const getPersistedSettings = (): AppSettings => {
  const persisted = readStorageItem<Partial<AppSettings>>(STORAGE_KEYS.settings)
  if (!persisted) return DEFAULT_SETTINGS

  return {
    sound: persisted.sound ?? DEFAULT_SETTINGS.sound,
    vibration: persisted.vibration ?? DEFAULT_SETTINGS.vibration,
    keepScreenAwake: persisted.keepScreenAwake ?? DEFAULT_SETTINGS.keepScreenAwake,
    layoutMode: persisted.layoutMode === 'classic' ? 'classic' : 'adaptive',
    highContrastMode: persisted.highContrastMode ?? DEFAULT_SETTINGS.highContrastMode,
    largeDigitsMode: persisted.largeDigitsMode ?? DEFAULT_SETTINGS.largeDigitsMode,
  }
}

const getPersistedLastUsedControl = (): LastUsedControl => {
  const persisted = readStorageItem<Partial<LastUsedControl>>(STORAGE_KEYS.lastUsedControl)
  if (!persisted) return DEFAULT_LAST_USED_CONTROL

  const fallbackPresetId = PRESETS[0].id
  const persistedPresetId = persisted.presetId ?? fallbackPresetId
  const hasPreset = PRESETS.some((preset) => preset.id === persistedPresetId)

  return {
    source: persisted.source === 'custom' ? 'custom' : 'preset',
    presetId: hasPreset ? persistedPresetId : fallbackPresetId,
    customBaseMinutes: persisted.customBaseMinutes ?? DEFAULT_LAST_USED_CONTROL.customBaseMinutes,
    customIncrementSeconds: persisted.customIncrementSeconds ?? DEFAULT_LAST_USED_CONTROL.customIncrementSeconds,
  }
}

const getPersistedOnboardingSeen = (): boolean => {
  const persisted = readStorageItem<boolean>(STORAGE_KEYS.onboardingSeen)
  return persisted === true
}

const isTimeControl = (value: unknown): value is TimeControl => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<TimeControl>
  return (
    typeof candidate.label === 'string' &&
    typeof candidate.baseMinutes === 'number' &&
    Number.isFinite(candidate.baseMinutes) &&
    candidate.baseMinutes > 0 &&
    typeof candidate.incrementSeconds === 'number' &&
    Number.isFinite(candidate.incrementSeconds) &&
    candidate.incrementSeconds >= 0 &&
    (candidate.source === 'preset' || candidate.source === 'custom')
  )
}

const asPersistedGameState = (value: unknown): PersistedGameState | null => {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<PersistedGameState>
  if (candidate.phase !== 'started') return null
  if (candidate.activeSide !== 'White' && candidate.activeSide !== 'Black') return null
  if (!candidate.remainingMs || typeof candidate.remainingMs !== 'object') return null
  if (typeof candidate.remainingMs.White !== 'number' || typeof candidate.remainingMs.Black !== 'number') return null
  if (typeof candidate.isPaused !== 'boolean') return null
  if (candidate.timeoutSide !== null && candidate.timeoutSide !== 'White' && candidate.timeoutSide !== 'Black') return null
  if (!isTimeControl(candidate.startedControl)) return null
  if (candidate.layoutMode !== 'adaptive' && candidate.layoutMode !== 'classic') return null
  if (typeof candidate.last_updated !== 'number' || !Number.isFinite(candidate.last_updated)) return null

  return {
    phase: 'started',
    activeSide: candidate.activeSide,
    remainingMs: {
      White: sanitizeMs(candidate.remainingMs.White),
      Black: sanitizeMs(candidate.remainingMs.Black),
    },
    isPaused: candidate.isPaused,
    timeoutSide: candidate.timeoutSide,
    startedControl: candidate.startedControl,
    layoutMode: candidate.layoutMode,
    last_updated: sanitizeMs(candidate.last_updated),
  }
}

const otherSide = (side: Side): Side => (side === 'White' ? 'Black' : 'White')

const sanitizeMs = (value: number) => Math.max(0, Math.round(value))

const getIncrementMs = (control: TimeControl | null) => {
  if (!control) return 0
  return sanitizeMs(control.incrementSeconds * 1000)
}

export const useAppStore = create<AppStore>((set, get) => {
  const persistedControl = getPersistedLastUsedControl()

  return {
    phase: 'setup',
    controlSource: persistedControl.source,
    selectedPreset: persistedControl.presetId,
    customBaseMinutes: persistedControl.customBaseMinutes,
    customIncrementSeconds: persistedControl.customIncrementSeconds,
    touched: { base: false, increment: false },
    attemptedStart: false,
    startedControl: null,
    activeSide: 'White',
    remainingMs: { White: 0, Black: 0 },
    isPaused: false,
    timeoutSide: null,
    undoHistory: [],
    settings: getPersistedSettings(),
    onboardingSeen: getPersistedOnboardingSeen(),
    setControlSource: (source) => set({ controlSource: source }),
    setSelectedPreset: (presetId) => set({ selectedPreset: presetId }),
    setCustomBaseMinutes: (value) => set({ customBaseMinutes: value }),
    setCustomIncrementSeconds: (value) => set({ customIncrementSeconds: value }),
    setTouched: (next) => set((state) => ({ touched: { ...state.touched, ...next } })),
    setAttemptedStart: (value) => set({ attemptedStart: value }),
    startGame: (control) => {
      const baseMs = sanitizeMs(control.baseMinutes * 60 * 1000)
      set({
        phase: 'started',
        startedControl: control,
        activeSide: 'White',
        remainingMs: { White: baseMs, Black: baseMs },
        undoHistory: [],
        timeoutSide: null,
        isPaused: false,
      })
    },
    tickActiveClock: (elapsedMs) => {
      set((state) => {
        if (state.phase !== 'started' || state.isPaused || state.timeoutSide || elapsedMs <= 0) {
          return state
        }

        const elapsed = sanitizeMs(elapsedMs)
        if (elapsed <= 0) return state

        const side = state.activeSide
        const currentRemainingMs = state.remainingMs[side]
        const nextRemainingMs = Math.max(0, currentRemainingMs - elapsed)
        const didClockChange = nextRemainingMs !== currentRemainingMs

        if (!didClockChange) {
          return state
        }

        const nextState: Partial<AppStore> = {
          remainingMs: didClockChange ? { ...state.remainingMs, [side]: nextRemainingMs } : state.remainingMs,
        }

        if (nextRemainingMs <= 0) {
          nextState.timeoutSide = side
          nextState.isPaused = true
        }

        return nextState as AppStore
      })
    },
    passTurn: () => {
      const state = get()
      if (state.phase !== 'started' || state.isPaused || state.timeoutSide) return null

      const fromSide = state.activeSide
      const toSide = otherSide(fromSide)
      const snapshot: TurnSnapshot = {
        activeSide: state.activeSide,
        remainingMs: {
          White: state.remainingMs.White,
          Black: state.remainingMs.Black,
        },
        isPaused: state.isPaused,
        timeoutSide: state.timeoutSide,
      }

      const incrementMs = getIncrementMs(state.startedControl)
      const nextRemainingMs = {
        ...state.remainingMs,
        [fromSide]: state.remainingMs[fromSide] + incrementMs,
      }

      set({
        undoHistory: [...state.undoHistory, snapshot],
        activeSide: toSide,
        remainingMs: nextRemainingMs,
      })

      return { fromSide, toSide }
    },
    pauseGame: () => set({ isPaused: true }),
    resumeGame: () => {
      const state = get()
      if (state.timeoutSide) return
      set({ isPaused: false })
    },
    togglePause: () => {
      const state = get()
      if (state.timeoutSide) return
      set({ isPaused: !state.isPaused })
    },
    undoTurn: () => {
      const state = get()
      if (state.undoHistory.length === 0) return false

      const snapshot = state.undoHistory[state.undoHistory.length - 1]
      if (!snapshot) return false

      set({
        undoHistory: state.undoHistory.slice(0, -1),
        activeSide: snapshot.activeSide,
        remainingMs: snapshot.remainingMs,
        isPaused: snapshot.isPaused,
        timeoutSide: snapshot.timeoutSide,
      })

      return true
    },
    resetGame: () => {
      const state = get()
      if (!state.startedControl) return

      const baseMs = sanitizeMs(state.startedControl.baseMinutes * 60 * 1000)
      set({
        remainingMs: { White: baseMs, Black: baseMs },
        activeSide: 'White',
        undoHistory: [],
        timeoutSide: null,
        isPaused: false,
      })
    },
    backToSetup: () => set({ phase: 'setup', attemptedStart: false, isPaused: false }),
    updateSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
    setOnboardingSeen: (value) => set({ onboardingSeen: value }),
    persistGameState: () => {
      if (typeof window === 'undefined') return

      try {
        const state = get()
        if (state.phase !== 'started' || !state.startedControl) {
          window.localStorage.removeItem(STORAGE_KEYS.gameState)
          return
        }

        const payload: PersistedGameState = {
          phase: 'started',
          activeSide: state.activeSide,
          remainingMs: {
            White: sanitizeMs(state.remainingMs.White),
            Black: sanitizeMs(state.remainingMs.Black),
          },
          isPaused: state.isPaused,
          timeoutSide: state.timeoutSide,
          startedControl: state.startedControl,
          layoutMode: state.settings.layoutMode,
          last_updated: Date.now(),
        }

        window.localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(payload))
      } catch {
        // noop
      }
    },
    restorePersistedGameState: () => {
      if (typeof window === 'undefined') return 'missing'

      const rawPersisted = readStorageItem<unknown>(STORAGE_KEYS.gameState)
      if (!rawPersisted) return 'missing'

      const persisted = asPersistedGameState(rawPersisted)
      if (!persisted) {
        window.localStorage.removeItem(STORAGE_KEYS.gameState)
        return 'invalid'
      }

      if (Date.now() - persisted.last_updated > GAME_STATE_MAX_AGE_MS) {
        window.localStorage.removeItem(STORAGE_KEYS.gameState)
        return 'expired'
      }

      set((state) => ({
        phase: 'started',
        attemptedStart: false,
        startedControl: persisted.startedControl,
        activeSide: persisted.activeSide,
        remainingMs: persisted.remainingMs,
        isPaused: persisted.isPaused,
        timeoutSide: persisted.timeoutSide,
        undoHistory: [],
        settings: {
          ...state.settings,
          layoutMode: persisted.layoutMode,
        },
      }))

      return 'restored'
    },
  }
})
