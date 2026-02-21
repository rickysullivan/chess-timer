import { useEffect, useRef } from 'react'
import { STORAGE_KEYS, type AppSettings, type ControlSource, type LayoutMode, type Side, type TimeControl } from '@/app/types'

type RestoreOutcome = 'restored' | 'expired' | 'missing' | 'invalid'

type UsePersistenceLifecycleOptions = {
  settings: AppSettings
  onboardingSeen: boolean
  controlSelection: {
    source: ControlSource
    presetId: string
    customBaseMinutes: string
    customIncrementSeconds: string
    customDelaySeconds: string
  }
  gameStateSnapshot: {
    phase: 'setup' | 'started'
    activeSide: Side
    remainingMs: Record<Side, number>
    activeDelayRemainingMs: number
    isPaused: boolean
    timeoutSide: Side | null
    startedControl: TimeControl | null
    layoutMode: LayoutMode
  }
  persistGameState: () => void
  restorePersistedGameState: () => RestoreOutcome
  onRestoreOutcome?: (outcome: RestoreOutcome) => void
}

export function usePersistenceLifecycle(options: UsePersistenceLifecycleOptions) {
  const {
    settings,
    onboardingSeen,
    controlSelection,
    gameStateSnapshot,
    persistGameState,
    restorePersistedGameState,
    onRestoreOutcome,
  } = options
  const didAttemptRestoreRef = useRef(false)

  useEffect(() => {
    if (didAttemptRestoreRef.current) return
    didAttemptRestoreRef.current = true

    const outcome = restorePersistedGameState()
    onRestoreOutcome?.(outcome)
  }, [onRestoreOutcome, restorePersistedGameState])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(STORAGE_KEYS.lastUsedControl, JSON.stringify(controlSelection))
  }, [controlSelection])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.onboardingSeen, JSON.stringify(onboardingSeen))
  }, [onboardingSeen])

  useEffect(() => {
    persistGameState()
  }, [gameStateSnapshot, persistGameState])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const flushGameState = () => {
      persistGameState()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushGameState()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', flushGameState)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', flushGameState)
    }
  }, [persistGameState])
}
