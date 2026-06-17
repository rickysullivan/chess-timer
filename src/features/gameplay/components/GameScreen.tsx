import { RotateCcw, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AlertDialog, Button } from '@heroui/react'
import { formatMs, type ActionMessageTone, type AppSettings, type Side, type TimeControl } from '@/app/types'

type GameScreenProps = {
  headerActions: ReactNode
  warningBanner: ReactNode
  settingsDrawer: ReactNode
  actionMessage: { tone: ActionMessageTone; text: string } | null
  liveAnnouncement: string
  settings: AppSettings
  startedControl: TimeControl
  activeSide: Side
  remainingMs: Record<Side, number>
  activeDelayRemainingMs: number
  timeoutSide: Side | null
  isPaused: boolean
  canUndo: boolean
  onboardingSeen: boolean
  onDismissOnboarding: () => void
  onSideTap: (side: Side) => void
  onPauseResume: () => void
  onUndo: () => void
  onReset: () => void
  onBackToSetup: () => void
}

export function GameScreen(props: GameScreenProps) {
  const { onDismissOnboarding, onReset } = props
  const inactiveSide = props.activeSide === 'White' ? 'Black' : 'White'
  const shouldShowOnboardingCue = props.settings.layoutMode === 'adaptive' && !props.onboardingSeen
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const isEnded = Boolean(props.timeoutSide)

  const handleReset = useCallback(() => {
    setIsResetDialogOpen(true)
  }, [])

  const handleResetConfirm = useCallback(() => {
    onReset()
  }, [onReset])

  useEffect(() => {
    if (!shouldShowOnboardingCue) return

    const timer = window.setTimeout(() => {
      onDismissOnboarding()
    }, 3000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [onDismissOnboarding, shouldShowOnboardingCue])

  const activeIndicatorText = `${props.activeSide} to move`
  const pausedDigitSizeClass = props.settings.largeDigitsMode ? 'text-3xl md:text-4xl' : 'text-2xl'
  const activeDigitSizeClass = props.settings.largeDigitsMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
  const inactiveDigitSizeClass = props.settings.largeDigitsMode ? 'text-3xl md:text-4xl' : 'text-2xl'

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-4 md:py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-semibold text-white">
            chess-timer
            <span className="rounded-full bg-orange-400/20 px-2 py-0.5 text-xs font-semibold text-orange-300">
              {props.startedControl.label}
            </span>
          </div>
          {props.headerActions}
        </div>
        {props.actionMessage ? (
          <p
            className={`mt-2 text-sm ${
              props.actionMessage.tone === 'success'
                ? 'text-emerald-700'
                : props.actionMessage.tone === 'error'
                  ? 'text-red-600'
                  : 'text-slate-600'
            }`}
            role="status"
            aria-live="polite"
          >
            {props.actionMessage.text}
          </p>
        ) : null}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {props.liveAnnouncement}
        </p>

        {shouldShowOnboardingCue ? (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p>Tap your side to switch. Tap the small strip to pause.</p>
            <button
              type="button"
              onClick={props.onDismissOnboarding}
              aria-label="Dismiss onboarding tip"
              className="inline-flex items-center justify-center rounded-md border border-sky-300 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-800 transition hover:bg-sky-100"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        {props.warningBanner}

        <div className="mt-4 flex flex-1 flex-col min-h-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{activeIndicatorText}</p>
          {props.activeDelayRemainingMs > 0 && !props.isPaused && !props.timeoutSide ? (
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-slate-500" aria-live="polite">
              Delay: {(props.activeDelayRemainingMs / 1000).toFixed(1)}s
            </p>
          ) : null}

          {props.isPaused && !isEnded ? (
            <div className="mt-3 flex flex-1 flex-col gap-3 animate-fade-in" aria-live="polite">
              <div className="grid flex-1 grid-cols-2 gap-2" role="group" aria-label="Paused timers">
                <div className={`flex flex-col justify-center rounded-xl border px-4 py-4 text-left ${props.settings.highContrastMode ? 'border-2 border-slate-800 bg-white text-slate-900' : 'border border-slate-200 bg-slate-50 text-slate-900'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">White</p>
                  <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass}`}>
                    {formatMs(props.remainingMs.White)}
                  </p>
                </div>
                <div className={`flex flex-col justify-center rounded-xl border px-4 py-4 text-left ${props.settings.highContrastMode ? 'border-2 border-slate-800 bg-white text-slate-900' : 'border border-slate-200 bg-slate-50 text-slate-900'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Black</p>
                  <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass}`}>
                    <span className="inline-block rotate-180">{formatMs(props.remainingMs.Black)}</span>
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onPress={props.onPauseResume}
                aria-label={`Resume game with ${props.activeSide} to move`}
              >
                Resume ({props.activeSide} to move)
              </Button>
            </div>
          ) : isEnded ? (
            <div className="mt-3 flex flex-1 flex-col gap-3 animate-fade-in" aria-live="polite">
              <div className="grid flex-1 grid-cols-2 gap-2" role="group" aria-label="Game ended timers">
                <div className={`flex flex-col justify-center rounded-xl border px-4 py-4 text-left ${props.timeoutSide === 'White' ? 'border border-slate-200 bg-slate-100 opacity-60' : 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">White</p>
                  <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass} ${props.timeoutSide === 'White' ? 'line-through' : ''}`}>
                    {formatMs(props.remainingMs.White)}
                  </p>
                  {props.timeoutSide === 'White' ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Time Out</p>
                  ) : null}
                </div>
                <div className={`flex flex-col justify-center rounded-xl border px-4 py-4 text-left ${props.timeoutSide === 'Black' ? 'border border-slate-200 bg-slate-100 opacity-60' : 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Black</p>
                  <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass} ${props.timeoutSide === 'Black' ? 'line-through' : ''}`}>
                    <span className="inline-block rotate-180">{formatMs(props.remainingMs.Black)}</span>
                  </p>
                  {props.timeoutSide === 'Black' ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Time Out</p>
                  ) : null}
                </div>
              </div>
              <p className="text-center text-sm font-semibold text-red-600" role="alert">
                {props.timeoutSide} ran out of time.{' '}
                {props.timeoutSide === 'White' ? 'Black wins!' : 'White wins!'}
              </p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Game end controls">
                <Button
                  variant="outline"
                  onPress={props.onBackToSetup}
                  aria-label="Return to setup screen"
                >
                  Back to Setup
                </Button>
                <Button
                  variant="danger-soft"
                  onPress={handleReset}
                  aria-label="Reset game to initial time control"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`mt-3 flex flex-1 min-h-0 gap-2 ${
                props.settings.layoutMode === 'adaptive' ? 'flex-col md:h-auto md:flex-row' : 'flex-col'
              } ${props.settings.highContrastMode ? 'border-2 border-slate-900 bg-slate-50 p-2' : ''}`}
              aria-live="polite"
            >
              <button
                type="button"
                onClick={() => props.onSideTap(props.activeSide)}
                disabled={isEnded}
                aria-label={`${props.activeSide} active timer. ${formatMs(props.remainingMs[props.activeSide])}. Tap to pass turn.`}
                className={`flex flex-[4] flex-col justify-center rounded-xl px-4 py-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  props.settings.highContrastMode
                    ? 'border-2 border-slate-950 bg-amber-200 text-slate-950 hover:bg-amber-300'
                    : 'border border-orange-200 bg-orange-50 text-slate-900 hover:bg-orange-100'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">{props.activeSide} (active)</p>
                <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                  <span className={props.activeSide === 'Black' ? 'inline-block rotate-180' : undefined}>
                    {formatMs(props.remainingMs[props.activeSide])}
                  </span>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Tap to pass turn</p>
              </button>

              <button
                type="button"
                onClick={() => props.onSideTap(inactiveSide)}
                disabled={isEnded}
                aria-label={`${inactiveSide} inactive timer. ${formatMs(props.remainingMs[inactiveSide])}. Tap to pause game.`}
                className={`flex flex-1 flex-col justify-center rounded-xl px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  props.settings.highContrastMode
                    ? 'border-2 border-slate-700 bg-white text-slate-800 hover:bg-slate-100'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">{inactiveSide}</p>
                <p className={`mt-1 font-semibold tabular-nums text-slate-900 ${inactiveDigitSizeClass}`}>
                  <span className={inactiveSide === 'Black' ? 'inline-block rotate-180' : undefined}>
                    {formatMs(props.remainingMs[inactiveSide])}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Tap to pause</p>
              </button>
            </div>
          )}
        </div>

        {!isEnded && !props.isPaused ? (
          <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="In-game controls">
            <Button
              variant="outline"
              onPress={props.onPauseResume}
              isDisabled={Boolean(props.timeoutSide)}
              aria-label={props.isPaused ? 'Resume game' : 'Pause game'}
            >
              {props.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="outline" onPress={props.onUndo} isDisabled={!props.canUndo} aria-label="Undo last turn switch">
              <Undo2 className="mr-2 size-4" />
              Undo
            </Button>
            <Button variant="outline" onPress={handleReset} aria-label="Reset game to initial time control">
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>
          </div>
        ) : null}

        {!isEnded ? (
          <div className="pt-4">
            <Button variant="ghost" onPress={props.onBackToSetup} aria-label="Return to setup screen" className="w-full">
              Back to Setup
            </Button>
          </div>
        ) : null}
      </div>
      {props.settingsDrawer}

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} isDismissable>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Reset game?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will reset the game and clear undo history. This action cannot be undone.{' '}
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button slot="close" variant="danger" onPress={handleResetConfirm}>
                  Reset
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </main>
  )
}