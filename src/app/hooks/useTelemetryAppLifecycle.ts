import { useEffect, useRef } from 'react'
import { captureEvent } from '@/lib/telemetry'
import type { LayoutMode } from '@/app/types'

type RestoreOutcome = 'restored' | 'expired' | 'missing' | 'invalid' | null

type UseTelemetryAppLifecycleOptions = {
  layoutMode: LayoutMode
  restoreOutcome: RestoreOutcome
}

export function useTelemetryAppLifecycle(options: UseTelemetryAppLifecycleOptions) {
  const didTrackAppOpenRef = useRef(false)

  useEffect(() => {
    if (didTrackAppOpenRef.current) return
    didTrackAppOpenRef.current = true

    captureEvent('app_open', {
      layout_mode: options.layoutMode,
    })
  }, [options.layoutMode])

  useEffect(() => {
    if (options.restoreOutcome === 'restored') {
      captureEvent('game_state_restored')
      return
    }

    if (options.restoreOutcome === 'expired') {
      captureEvent('game_state_expired')
    }
  }, [options.restoreOutcome])
}
