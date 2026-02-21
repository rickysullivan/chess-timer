import { useEffect, useRef } from 'react'

type WakeLockSentinelLike = {
  release: () => Promise<void>
  addEventListener?: (type: 'release', listener: () => void) => void
}

type WakeLockLike = {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

type UseWakeLockOptions = {
  enabled: boolean
  onError?: (error: unknown, context: Record<string, unknown>) => void
}

export function useWakeLock(options: UseWakeLockOptions) {
  const { enabled, onError } = options
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined' || typeof navigator === 'undefined') return

    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock
    if (!wakeLock) return

    let cancelled = false

    const releaseWakeLock = async () => {
      const sentinel = sentinelRef.current
      if (!sentinel) return
      sentinelRef.current = null

      try {
        await sentinel.release()
      } catch (error) {
        onError?.(error, {
          operation: 'wake_lock_release',
          keep_screen_awake: enabled,
        })
      }
    }

    const requestWakeLock = async () => {
      if (!enabled || document.visibilityState !== 'visible') {
        await releaseWakeLock()
        return
      }

      if (sentinelRef.current) return

      try {
        const sentinel = await wakeLock.request('screen')
        if (cancelled) {
          await sentinel.release()
          return
        }

        sentinelRef.current = sentinel
        sentinel.addEventListener?.('release', () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null
          }
        })
      } catch (error) {
        onError?.(error, {
          operation: 'wake_lock_request',
          keep_screen_awake: enabled,
        })
        sentinelRef.current = null
      }
    }

    void requestWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock()
      } else {
        void releaseWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void releaseWakeLock()
    }
  }, [enabled, onError])
}
