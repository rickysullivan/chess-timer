import { useEffect } from 'react'

type UseGameTickerOptions = {
  phase: 'setup' | 'started'
  isPaused: boolean
  timeoutSide: 'White' | 'Black' | null
  tickActiveClock: (elapsedMs: number) => void
}

export function useGameTicker(options: UseGameTickerOptions) {
  const { phase, isPaused, timeoutSide, tickActiveClock } = options

  useEffect(() => {
    if (phase !== 'started' || isPaused || timeoutSide) return

    let frameId = 0
    let lastTimestamp: number | null = null

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
        frameId = requestAnimationFrame(tick)
        return
      }

      const elapsed = timestamp - lastTimestamp
      lastTimestamp = timestamp
      tickActiveClock(elapsed)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isPaused, phase, tickActiveClock, timeoutSide])
}
