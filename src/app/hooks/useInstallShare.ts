import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type InstallResult = 'accepted' | 'dismissed' | 'unavailable' | 'error'

export type ShareResult = {
  method: 'web_share' | 'copy_link'
  outcome: 'success' | 'failure' | 'canceled'
}

type UseInstallShareOptions = {
  onError?: (error: unknown, context: Record<string, unknown>) => void
  onAppInstalled?: () => void
}

const copyTextToClipboard = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  if (typeof document === 'undefined') return false

  try {
    const helper = document.createElement('textarea')
    helper.value = text
    helper.setAttribute('readonly', 'true')
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.appendChild(helper)
    helper.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(helper)
    return copied
  } catch {
    return false
  }
}

export function useInstallShare(options: UseInstallShareOptions) {
  const { onAppInstalled, onError } = options
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standaloneMatch = window.matchMedia?.('(display-mode: standalone)').matches
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standaloneMatch || iosStandalone) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setInstallPromptEvent(promptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPromptEvent(null)
      onAppInstalled?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onAppInstalled])

  const installApp = async (): Promise<InstallResult> => {
    if (!installPromptEvent) {
      return 'unavailable'
    }

    try {
      await installPromptEvent.prompt()
      const choice = await installPromptEvent.userChoice
      const accepted = choice.outcome === 'accepted'
      if (accepted) {
        setIsInstalled(true)
        return 'accepted'
      }

      return 'dismissed'
    } catch (error) {
      onError?.(error, { operation: 'pwa_install' })
      return 'error'
    } finally {
      setInstallPromptEvent(null)
    }
  }

  const shareCurrentUrl = async (): Promise<ShareResult> => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { method: 'copy_link', outcome: 'failure' }
    }

    const currentUrl = window.location.href

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'chess-timer',
          text: 'Use this simple chess timer for your next game.',
          url: currentUrl,
        })
        return { method: 'web_share', outcome: 'success' }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return { method: 'web_share', outcome: 'canceled' }
        }

        onError?.(error, {
          operation: 'web_share',
        })
      }
    }

    const copied = await copyTextToClipboard(currentUrl)
    if (copied) {
      return { method: 'copy_link', outcome: 'success' }
    }

    return { method: 'copy_link', outcome: 'failure' }
  }

  return {
    canInstall: Boolean(installPromptEvent) && !isInstalled,
    isInstalled,
    installApp,
    shareCurrentUrl,
  }
}
