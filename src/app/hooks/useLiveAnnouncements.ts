import { useMemo } from 'react'

type RestoreOutcome = 'restored' | 'expired' | 'missing' | 'invalid' | null

type UseLiveAnnouncementsOptions = {
  phase: 'setup' | 'started'
  isPaused: boolean
  timeoutSide: 'White' | 'Black' | null
  restoreOutcome: RestoreOutcome
}

export function useLiveAnnouncements(options: UseLiveAnnouncementsOptions) {
  return useMemo(() => {
    if (options.restoreOutcome === 'restored') {
      return 'Previous game restored.'
    }

    if (options.phase !== 'started') {
      return ''
    }

    if (options.timeoutSide) {
      return `${options.timeoutSide} ran out of time.`
    }

    return options.isPaused ? 'Game paused.' : 'Game resumed.'
  }, [options.isPaused, options.phase, options.restoreOutcome, options.timeoutSide])
}
