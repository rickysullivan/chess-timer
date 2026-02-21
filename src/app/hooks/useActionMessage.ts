import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActionMessageTone } from '@/app/types'

export function useActionMessage() {
  const [actionMessage, setActionMessage] = useState<{ tone: ActionMessageTone; text: string } | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const showActionMessage = useCallback((tone: ActionMessageTone, text: string) => {
    setActionMessage({ tone, text })
  }, [])

  useEffect(() => {
    if (!actionMessage || typeof window === 'undefined') return

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setActionMessage(null)
      timeoutRef.current = null
    }, 2800)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [actionMessage])

  return { actionMessage, showActionMessage }
}
