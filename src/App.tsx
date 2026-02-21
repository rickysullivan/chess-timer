import { Download, Settings2, Share2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useActionMessage } from '@/app/hooks/useActionMessage'
import { useGameTicker } from '@/app/hooks/useGameTicker'
import { useAppStore } from '@/app/store'
import { useInstallShare } from '@/app/hooks/useInstallShare'
import { useLiveAnnouncements } from '@/app/hooks/useLiveAnnouncements'
import { usePersistenceLifecycle } from '@/app/hooks/usePersistenceLifecycle'
import { useTelemetryAppLifecycle } from '@/app/hooks/useTelemetryAppLifecycle'
import { useWakeLock } from '@/app/hooks/useWakeLock'
import {
  PRESETS,
  parseNumber,
  type ControlSource,
  type TimeControl,
} from '@/app/types'
import { GameScreen } from '@/features/gameplay/components/GameScreen'
import { SettingsDrawer } from '@/features/settings/components/SettingsDrawer'
import { SetupScreen } from '@/features/setup/components/SetupScreen'
import { captureError, captureEvent } from '@/lib/telemetry'

const getControlEventProperties = (control: TimeControl | null) => {
  if (!control) return {}

  return {
    base_minutes: control.baseMinutes,
    increment_seconds: control.incrementSeconds,
    delay_seconds: control.delaySeconds,
  }
}

function App() {
  const phase = useAppStore((state) => state.phase)
  const controlSource = useAppStore((state) => state.controlSource)
  const selectedPreset = useAppStore((state) => state.selectedPreset)
  const customBaseMinutes = useAppStore((state) => state.customBaseMinutes)
  const customIncrementSeconds = useAppStore((state) => state.customIncrementSeconds)
  const customDelaySeconds = useAppStore((state) => state.customDelaySeconds)
  const touched = useAppStore((state) => state.touched)
  const attemptedStart = useAppStore((state) => state.attemptedStart)
  const startedControl = useAppStore((state) => state.startedControl)
  const activeSide = useAppStore((state) => state.activeSide)
  const remainingMs = useAppStore((state) => state.remainingMs)
  const activeDelayRemainingMs = useAppStore((state) => state.activeDelayRemainingMs)
  const isPaused = useAppStore((state) => state.isPaused)
  const timeoutSide = useAppStore((state) => state.timeoutSide)
  const undoHistory = useAppStore((state) => state.undoHistory)
  const settings = useAppStore((state) => state.settings)
  const onboardingSeen = useAppStore((state) => state.onboardingSeen)

  const setControlSource = useAppStore((state) => state.setControlSource)
  const setSelectedPreset = useAppStore((state) => state.setSelectedPreset)
  const setCustomBaseMinutes = useAppStore((state) => state.setCustomBaseMinutes)
  const setCustomIncrementSeconds = useAppStore((state) => state.setCustomIncrementSeconds)
  const setCustomDelaySeconds = useAppStore((state) => state.setCustomDelaySeconds)
  const setTouched = useAppStore((state) => state.setTouched)
  const setAttemptedStart = useAppStore((state) => state.setAttemptedStart)
  const startGame = useAppStore((state) => state.startGame)
  const tickActiveClock = useAppStore((state) => state.tickActiveClock)
  const passTurn = useAppStore((state) => state.passTurn)
  const pauseGame = useAppStore((state) => state.pauseGame)
  const togglePause = useAppStore((state) => state.togglePause)
  const undoTurn = useAppStore((state) => state.undoTurn)
  const resetGame = useAppStore((state) => state.resetGame)
  const backToSetup = useAppStore((state) => state.backToSetup)
  const updateSetting = useAppStore((state) => state.updateSetting)
  const setOnboardingSeen = useAppStore((state) => state.setOnboardingSeen)
  const persistGameState = useAppStore((state) => state.persistGameState)
  const restorePersistedGameState = useAppStore((state) => state.restorePersistedGameState)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [restoreOutcome, setRestoreOutcome] = useState<'restored' | 'expired' | 'missing' | 'invalid' | null>(null)
  const { actionMessage, showActionMessage } = useActionMessage()

  const selectedPresetControl = useMemo(() => PRESETS.find((preset) => preset.id === selectedPreset), [selectedPreset])

  const customBaseError = useMemo(() => {
    const value = customBaseMinutes.trim()
    if (!value) return 'Base minutes is required.'
    const parsed = parseNumber(value)
    if (Number.isNaN(parsed) || parsed <= 0) return 'Base minutes must be greater than 0.'
    return null
  }, [customBaseMinutes])

  const customIncrementError = useMemo(() => {
    const value = customIncrementSeconds.trim()
    if (!value) return 'Increment seconds is required.'
    const parsed = parseNumber(value)
    if (Number.isNaN(parsed) || parsed < 0) return 'Increment seconds must be 0 or greater.'
    return null
  }, [customIncrementSeconds])

  const customDelayError = useMemo(() => {
    const value = customDelaySeconds.trim()
    if (!value) return 'Delay seconds is required.'
    const parsed = parseNumber(value)
    if (Number.isNaN(parsed) || parsed < 0) return 'Delay seconds must be 0 or greater.'
    return null
  }, [customDelaySeconds])

  const customControl = useMemo<TimeControl | null>(() => {
    if (customBaseError || customIncrementError || customDelayError) return null

    return {
      label: `${customBaseMinutes}+${customIncrementSeconds}`,
      baseMinutes: parseNumber(customBaseMinutes),
      incrementSeconds: parseNumber(customIncrementSeconds),
      delaySeconds: parseNumber(customDelaySeconds),
      source: 'custom',
    }
  }, [customBaseError, customBaseMinutes, customDelayError, customDelaySeconds, customIncrementError, customIncrementSeconds])

  const selectedControl = useMemo<TimeControl | null>(() => {
    if (controlSource === 'preset') {
      if (!selectedPresetControl) return null

      return {
        label: selectedPresetControl.label,
        baseMinutes: selectedPresetControl.baseMinutes,
        incrementSeconds: selectedPresetControl.incrementSeconds,
        delaySeconds: selectedPresetControl.delaySeconds,
        source: 'preset',
      }
    }

    return customControl
  }, [controlSource, customControl, selectedPresetControl])

  const startError = useMemo(() => {
    if (controlSource === 'preset' && !selectedPresetControl) {
      return 'Pick a preset to start.'
    }

    if (controlSource === 'custom' && !customControl) {
      return 'Enter valid custom values before starting.'
    }

    return null
  }, [controlSource, customControl, selectedPresetControl])

  const canStart = selectedControl !== null
  const canUndo = undoHistory.length > 0

  const controlSelection = useMemo(
    () => ({
      source: controlSource,
      presetId: selectedPreset,
      customBaseMinutes,
      customIncrementSeconds,
      customDelaySeconds,
    }),
    [controlSource, customBaseMinutes, customDelaySeconds, customIncrementSeconds, selectedPreset],
  )

  const gameStateSnapshot = useMemo(
    () => ({
      phase,
      activeSide,
      remainingMs,
      activeDelayRemainingMs,
      isPaused,
      timeoutSide,
      startedControl,
      layoutMode: settings.layoutMode,
    }),
    [activeDelayRemainingMs, activeSide, isPaused, phase, remainingMs, settings.layoutMode, startedControl, timeoutSide],
  )

  const degradedModeWarning = useMemo(() => {
    if (typeof navigator === 'undefined') return null

    const missingFeatures: string[] = []
    if (!('serviceWorker' in navigator)) {
      missingFeatures.push('offline support')
    }
    if (!('wakeLock' in navigator)) {
      missingFeatures.push('keep-screen-awake')
    }

    if (missingFeatures.length === 0) return null

    const featuresLabel =
      missingFeatures.length === 1
        ? missingFeatures[0]
        : `${missingFeatures.slice(0, -1).join(', ')} and ${missingFeatures[missingFeatures.length - 1]}`

    return `Heads up: your browser does not support ${featuresLabel}. The timer still works in degraded mode.`
  }, [])

  usePersistenceLifecycle({
    settings,
    onboardingSeen,
    controlSelection,
    gameStateSnapshot,
    persistGameState,
    restorePersistedGameState,
    onRestoreOutcome: setRestoreOutcome,
  })

  useTelemetryAppLifecycle({
    layoutMode: settings.layoutMode,
    restoreOutcome,
  })

  useWakeLock({
    enabled: settings.keepScreenAwake,
    onError: captureError,
  })

  useGameTicker({
    phase,
    isPaused,
    timeoutSide,
    tickActiveClock,
  })

  const handleAppInstalled = useCallback(() => {
    showActionMessage('success', 'App installed. You can launch it from your home screen.')
  }, [showActionMessage])

  const { canInstall, installApp, shareCurrentUrl } = useInstallShare({
    onError: captureError,
    onAppInstalled: handleAppInstalled,
  })

  const liveAnnouncement = useLiveAnnouncements({
    phase,
    isPaused,
    timeoutSide,
    restoreOutcome,
  })

  const playInteractionFeedback = useCallback(
    (kind: 'turn_switch' | 'pause' | 'resume') => {
      if (settings.vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(kind === 'turn_switch' ? 20 : 12)
        } catch (error) {
          captureError(error, { source: 'haptics', kind })
        }
      }

      if (!settings.sound || typeof window === 'undefined') return

      try {
        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioCtx) return
        const context = new AudioCtx()
        const oscillator = context.createOscillator()
        const gain = context.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = kind === 'turn_switch' ? 900 : 640
        gain.gain.value = 0.04

        oscillator.connect(gain)
        gain.connect(context.destination)

        oscillator.start()
        oscillator.stop(context.currentTime + 0.05)

        oscillator.onended = () => {
          context.close().catch(() => undefined)
        }
      } catch (error) {
        captureError(error, { source: 'sound_feedback', kind })
      }
    },
    [settings.sound, settings.vibration],
  )

  const getElapsedSeconds = useCallback(
    (control: TimeControl | null) => {
      if (!control) return undefined

      const baseMs = Math.max(0, Math.round(control.baseMinutes * 60 * 1000))
      const elapsedMs = Math.max(0, baseMs - remainingMs.White) + Math.max(0, baseMs - remainingMs.Black)
      return Math.round(elapsedMs / 1000)
    },
    [remainingMs.Black, remainingMs.White],
  )

  const buildCoreEventProperties = useCallback(
    (options?: {
      control?: TimeControl | null
      includeElapsedSeconds?: boolean
      extra?: Record<string, unknown>
    }) => {
      const control = options?.control ?? startedControl
      const properties: Record<string, unknown> = {
        layout_mode: settings.layoutMode,
        ...getControlEventProperties(control ?? null),
        ...(options?.extra ?? {}),
      }

      if (options?.includeElapsedSeconds) {
        const elapsedSeconds = getElapsedSeconds(control ?? null)
        if (typeof elapsedSeconds === 'number') {
          properties.elapsed_seconds = elapsedSeconds
        }
      }

      return properties
    },
    [getElapsedSeconds, settings.layoutMode, startedControl],
  )

  const handleInstall = async () => {
    const result = await installApp()
    const accepted = result === 'accepted'

    captureEvent(
      'pwa_install',
      buildCoreEventProperties({
        extra: { accepted },
      }),
    )

    if (result === 'accepted') {
      showActionMessage('success', 'Install accepted.')
    } else if (result === 'dismissed') {
      showActionMessage('info', 'Install dismissed.')
    } else {
      showActionMessage('error', 'Install prompt was unavailable. Try again later.')
    }
  }

  const handleShare = async () => {
    const result = await shareCurrentUrl()

    captureEvent(
      'share_action',
      buildCoreEventProperties({
        extra: {
          method: result.method,
          outcome: result.outcome === 'canceled' ? 'failure' : result.outcome,
        },
      }),
    )

    if (result.outcome === 'success') {
      showActionMessage('success', result.method === 'web_share' ? 'Shared successfully.' : 'Link copied to clipboard.')
      return
    }

    if (result.outcome === 'canceled') {
      showActionMessage('info', 'Share canceled.')
      return
    }

    showActionMessage('error', 'Unable to share this link on this browser.')
  }

  const handleStart = () => {
    setAttemptedStart(true)
    if (!selectedControl) return

    const controlProperties = buildCoreEventProperties({
      control: selectedControl,
      extra: selectedControl.source === 'preset' ? { preset_id: selectedPreset } : undefined,
    })
    captureEvent('game_start', controlProperties)

    if (selectedControl.source === 'custom') {
      captureEvent('custom_control_saved', controlProperties)
    }

    startGame(selectedControl)
  }

  const handleSideTap = (side: 'White' | 'Black') => {
    if (timeoutSide || isPaused) return

    if (side === activeSide) {
      const turnSwitch = passTurn()
      if (!turnSwitch) return

      captureEvent(
        'turn_switch',
        buildCoreEventProperties({
          includeElapsedSeconds: true,
          extra: {
            from_side: turnSwitch.fromSide,
            to_side: turnSwitch.toSide,
          },
        }),
      )
      playInteractionFeedback('turn_switch')
      return
    }

    captureEvent('pause', buildCoreEventProperties({ includeElapsedSeconds: true }))
    pauseGame()
    playInteractionFeedback('pause')
  }

  const handlePauseResume = () => {
    if (timeoutSide) return
    const nextPaused = !isPaused
    captureEvent(nextPaused ? 'pause' : 'resume', buildCoreEventProperties({ includeElapsedSeconds: true }))
    togglePause()
    playInteractionFeedback(nextPaused ? 'pause' : 'resume')
  }

  const handleUndo = () => {
    if (!undoTurn()) return
    captureEvent('undo', buildCoreEventProperties({ includeElapsedSeconds: true }))
  }

  const handleReset = () => {
    if (!startedControl) return

    const confirmed = window.confirm('Reset game and clear undo history?')
    if (!confirmed) return

    captureEvent('reset', buildCoreEventProperties({ includeElapsedSeconds: true }))
    resetGame()
  }

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)

    const selected = PRESETS.find((preset) => preset.id === presetId)
    if (!selected) return

    captureEvent(
      'preset_selected',
      buildCoreEventProperties({
        control: {
          label: selected.label,
          baseMinutes: selected.baseMinutes,
          incrementSeconds: selected.incrementSeconds,
          delaySeconds: selected.delaySeconds,
          source: 'preset',
        },
        extra: {
          preset_id: selected.id,
        },
      }),
    )
  }

  const dismissOnboardingCue = useCallback(() => {
    setOnboardingSeen(true)
  }, [setOnboardingSeen])

  const warningBanner = degradedModeWarning ? (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
      {degradedModeWarning}
    </div>
  ) : null

  const headerActions = (
    <div className="flex items-center gap-2">
      {canInstall ? (
        <button
          type="button"
          onClick={() => void handleInstall()}
          aria-label="Install app"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Download className="size-4" />
          Install
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void handleShare()}
        aria-label="Share app link"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Share2 className="size-4" />
        Share
      </button>
      <button
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Open settings"
        aria-haspopup="dialog"
        aria-expanded={isSettingsOpen}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Settings2 className="size-4" />
        Settings
      </button>
    </div>
  )

  const settingsDrawer = (
    <SettingsDrawer
      isOpen={isSettingsOpen}
      settings={settings}
      onClose={() => setIsSettingsOpen(false)}
      onUpdateSetting={updateSetting}
    />
  )

  const showCustomBaseError = controlSource === 'custom' && (attemptedStart || touched.base) && customBaseError
  const showCustomIncrementError =
    controlSource === 'custom' && (attemptedStart || touched.increment) && customIncrementError
  const showCustomDelayError = controlSource === 'custom' && (attemptedStart || touched.delay) && customDelayError

  if (phase === 'started' && startedControl) {
    return (
      <GameScreen
        headerActions={headerActions}
        warningBanner={warningBanner}
        settingsDrawer={settingsDrawer}
        actionMessage={actionMessage}
        liveAnnouncement={liveAnnouncement}
        settings={settings}
        startedControl={startedControl}
        activeSide={activeSide}
        remainingMs={remainingMs}
        activeDelayRemainingMs={activeDelayRemainingMs}
        timeoutSide={timeoutSide}
        isPaused={isPaused}
        canUndo={canUndo}
        onboardingSeen={onboardingSeen}
        onDismissOnboarding={dismissOnboardingCue}
        onSideTap={handleSideTap}
        onPauseResume={handlePauseResume}
        onUndo={handleUndo}
        onReset={handleReset}
        onBackToSetup={backToSetup}
      />
    )
  }

  return (
    <SetupScreen
      headerActions={headerActions}
      warningBanner={warningBanner}
      settingsDrawer={settingsDrawer}
      actionMessage={actionMessage}
      liveAnnouncement={liveAnnouncement}
      controlSource={controlSource}
      selectedPreset={selectedPreset}
      customBaseMinutes={customBaseMinutes}
      customIncrementSeconds={customIncrementSeconds}
      customDelaySeconds={customDelaySeconds}
      showCustomBaseError={showCustomBaseError}
      showCustomIncrementError={showCustomIncrementError}
      showCustomDelayError={showCustomDelayError}
      selectedControl={selectedControl}
      startError={startError}
      attemptedStart={attemptedStart}
      canStart={canStart}
      onControlSourceChange={(source: ControlSource) => setControlSource(source)}
      onPresetSelect={handlePresetSelect}
      onCustomBaseMinutesChange={setCustomBaseMinutes}
      onCustomIncrementSecondsChange={setCustomIncrementSeconds}
      onCustomDelaySecondsChange={setCustomDelaySeconds}
      onCustomBaseBlur={() => setTouched({ base: true })}
      onCustomIncrementBlur={() => setTouched({ increment: true })}
      onCustomDelayBlur={() => setTouched({ delay: true })}
      onStart={handleStart}
    />
  )
}

export default App
