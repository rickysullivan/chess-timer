import { CornerDownLeft, RotateCcw } from 'lucide-react'
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
  const pausedDigitSizeClass = props.settings.largeDigitsMode ? 'text-5xl md:text-6xl' : 'text-2xl'
  const activeDigitSizeClass = props.settings.largeDigitsMode ? 'text-7xl md:text-8xl' : 'text-4xl md:text-5xl'
  const inactiveDigitSizeClass = props.settings.largeDigitsMode ? 'text-5xl md:text-6xl' : 'text-2xl'
  const isPlaying = !props.isPaused && !isEnded
  const hideChrome = isPlaying

  return (
    <main id="game-screen" className="flex min-h-screen flex-col bg-slate-100">
      <div className="flex w-full flex-1 flex-col px-5 py-4 md:py-6">
        <div
          id="game-chrome"
          className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            hideChrome ? 'mt-0 max-h-0 overflow-hidden opacity-0' : 'mt-0 max-h-40 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div id="game-brand" className="flex items-center gap-2.5">
              <img
                src="/icons/plychss-mark.svg"
                alt=""
                aria-hidden="true"
                className="size-8 rounded-lg shadow-sm"
              />
              <p className="text-base font-bold tracking-tight text-slate-950">PlyChss</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 sm:text-xs">
                {props.startedControl.label}
              </span>
            </div>
            {props.headerActions}
          </div>
          {props.actionMessage ? (
            <p
              id="game-action-message"
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
          {shouldShowOnboardingCue ? (
            <div
              id="game-onboarding"
              className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
            >
              <p>Tap your side to switch. Tap the small strip to pause.</p>
              <button
                type="button"
                onClick={props.onDismissOnboarding}
                aria-label="Dismiss onboarding tip"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-sky-300 bg-white px-4 text-sm font-medium text-sky-900 transition hover:bg-sky-100"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {props.warningBanner}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {props.liveAnnouncement}
        </p>

        <div
          id="game-timers"
          className={`flex flex-1 flex-col min-h-0 ${hideChrome ? 'mt-0' : 'mt-4'} transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
        >
          {!isEnded ? (
            <div
              className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                hideChrome ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-6 opacity-100'
              }`}
            >
              <p
                id="game-active-indicator"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                {activeIndicatorText}
              </p>
            </div>
          ) : null}
          {props.isPaused && !isEnded ? (
            <div className="mt-3 flex flex-1 flex-col gap-3 animate-fade-in" aria-live="polite">
              <div
                className={`flex flex-1 gap-5 ${
                  props.settings.layoutMode === 'classic'
                    ? 'flex-col sm:flex-row'
                    : 'adaptive-landscape flex-col md:flex-row'
                }`}
                role="group"
                aria-label="Paused timers"
              >
                <div
                  className={`flex flex-1 flex-col justify-center rounded-xl border px-4 py-4 ${
                    props.settings.layoutMode === 'classic' ? 'items-center text-center' : 'text-left'
                  } ${
                    props.settings.highContrastMode
                      ? 'border-2 border-slate-800 bg-white text-slate-900'
                      : 'border border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="rotate-180">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Black{props.activeSide === 'Black' ? ' (active)' : ''}
                    </p>
                    <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass}`}>
                      {formatMs(props.remainingMs.Black)}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex flex-1 flex-col justify-center rounded-xl border px-4 py-4 ${
                    props.settings.layoutMode === 'classic' ? 'items-center text-center' : 'text-left'
                  } ${
                    props.settings.highContrastMode
                      ? 'border-2 border-slate-800 bg-white text-slate-900'
                      : 'border border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    White{props.activeSide === 'White' ? ' (active)' : ''}
                  </p>
                  <p className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass}`}>
                    {formatMs(props.remainingMs.White)}
                  </p>
                </div>
              </div>
              <Button
                className="w-full shadow-sm"
                onPress={props.onPauseResume}
                aria-label={`Resume game with ${props.activeSide} to move`}
              >
                Resume ({props.activeSide} to move)
              </Button>
            </div>
          ) : isEnded ? (
            <div className="mt-3 flex flex-1 flex-col gap-3 animate-fade-in" aria-live="polite">
              <div
                className={`flex flex-1 gap-5 ${props.settings.layoutMode === 'classic' ? 'flex-col sm:flex-row' : 'flex-col md:flex-row'}`}
                role="group"
                aria-label="Game ended timers"
              >
                <div
                  className={`flex flex-1 flex-col justify-center rounded-xl border px-4 py-4 ${
                    props.settings.layoutMode === 'classic' ? 'items-center text-center' : 'text-left'
                  } ${
                    props.timeoutSide === 'Black'
                      ? 'border border-slate-200 bg-slate-100 opacity-60'
                      : 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900'
                  }`}
                >
                  <div className="rotate-180">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Black</p>
                    <p
                      className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass} ${
                        props.timeoutSide === 'Black' ? 'line-through' : ''
                      }`}
                    >
                      {formatMs(props.remainingMs.Black)}
                    </p>
                    {props.timeoutSide === 'Black' ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
                        Time Out
                      </p>
                    ) : null}
                  </div>
                </div>
                <div
                  className={`flex flex-1 flex-col justify-center rounded-xl border px-4 py-4 ${
                    props.settings.layoutMode === 'classic' ? 'items-center text-center' : 'text-left'
                  } ${
                    props.timeoutSide === 'White'
                      ? 'border border-slate-200 bg-slate-100 opacity-60'
                      : 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">White</p>
                  <p
                    className={`mt-1 font-semibold tabular-nums ${pausedDigitSizeClass} ${
                      props.timeoutSide === 'White' ? 'line-through' : ''
                    }`}
                  >
                    {formatMs(props.remainingMs.White)}
                  </p>
                  {props.timeoutSide === 'White' ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
                      Time Out
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="text-center text-sm font-semibold text-red-600" role="alert">
                {props.timeoutSide} ran out of time. {props.timeoutSide === 'White' ? 'Black wins!' : 'White wins!'}
              </p>
              <div className="flex w-full gap-3" role="group" aria-label="Game end controls">
                <Button
                  variant="outline"
                  onPress={props.onBackToSetup}
                  aria-label="Return to setup screen"
                  className="flex-1"
                >
                  Back to Setup
                </Button>
                <Button
                  variant="danger-soft"
                  onPress={handleReset}
                  aria-label="Reset game to initial time control"
                  className="flex-1 shadow-sm"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-1 min-h-0 gap-5 ${hideChrome ? 'mt-0' : 'mt-3'} transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                props.settings.layoutMode === 'adaptive'
                  ? 'adaptive-landscape flex-col md:h-auto md:flex-row'
                  : 'flex-col sm:flex-row'
              } ${props.settings.highContrastMode ? 'bg-slate-100 p-2' : ''}`}
              aria-live="polite"
            >
              {props.settings.layoutMode === 'classic' ? (
                <>
                  <button
                    type="button"
                    id="timer-black"
                    onClick={() => props.onSideTap('Black')}
                    disabled={isEnded}
                    aria-label={`Black ${props.activeSide === 'Black' ? 'active' : 'inactive'} timer. ${formatMs(props.remainingMs.Black)}. ${props.activeSide === 'Black' ? 'Tap to pass turn.' : 'Tap to pause game.'}`}
                    className={`flex flex-1 flex-col items-center justify-center rounded-3xl px-4 py-4 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      props.settings.highContrastMode
                        ? props.activeSide === 'Black'
                          ? 'border-2 border-slate-950 bg-amber-200 text-slate-950 hover:bg-amber-300'
                          : 'border-2 border-slate-700 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : props.activeSide === 'Black'
                          ? 'border border-orange-200 bg-orange-50 text-slate-900 hover:bg-orange-100'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="rotate-180">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                        Black{props.activeSide === 'Black' ? ' (active)' : ''}
                      </p>
                      <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                        {formatMs(props.remainingMs.Black)}
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                        {props.activeSide === 'Black' ? 'Tap to pass turn' : 'Tap to pause'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="timer-white"
                    onClick={() => props.onSideTap('White')}
                    disabled={isEnded}
                    aria-label={`White ${props.activeSide === 'White' ? 'active' : 'inactive'} timer. ${formatMs(props.remainingMs.White)}. ${props.activeSide === 'White' ? 'Tap to pass turn.' : 'Tap to pause game.'}`}
                    className={`flex flex-1 flex-col items-center justify-center rounded-3xl px-4 py-4 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      props.settings.highContrastMode
                        ? props.activeSide === 'White'
                          ? 'border-2 border-slate-950 bg-amber-200 text-slate-950 hover:bg-amber-300'
                          : 'border-2 border-slate-700 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : props.activeSide === 'White'
                          ? 'border border-orange-200 bg-orange-50 text-slate-900 hover:bg-orange-100'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                      White{props.activeSide === 'White' ? ' (active)' : ''}
                    </p>
                    <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                      {formatMs(props.remainingMs.White)}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                      {props.activeSide === 'White' ? 'Tap to pass turn' : 'Tap to pause'}
                    </p>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    id="timer-black"
                    onClick={() => props.onSideTap('Black')}
                    disabled={isEnded}
                    aria-label={`Black ${props.activeSide === 'Black' ? 'active' : 'inactive'} timer. ${formatMs(props.remainingMs.Black)}. ${props.activeSide === 'Black' ? 'Tap to pass turn.' : 'Tap to pause game.'}`}
                    className={`flex transition-all duration-200 ease-in-out ${
                      props.activeSide === 'Black' ? 'flex-[3]' : 'flex-1'
                    } flex-col justify-center rounded-3xl px-4 ${props.activeSide === 'Black' ? 'py-4' : 'py-3'} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      props.settings.highContrastMode
                        ? props.activeSide === 'Black'
                          ? 'border-2 border-slate-950 bg-amber-200 text-slate-950 hover:bg-amber-300'
                          : 'border-2 border-slate-700 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : props.activeSide === 'Black'
                          ? 'border border-orange-200 bg-orange-50 text-slate-900 hover:bg-orange-100'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="rotate-180">
                      {props.activeSide === 'Black' ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em]">Black (active)</p>
                          <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                            {formatMs(props.remainingMs.Black)}
                          </p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            Tap to pass turn
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em]">Black</p>
                          <p className={`mt-1 font-semibold tabular-nums text-slate-900 ${inactiveDigitSizeClass}`}>
                            {formatMs(props.remainingMs.Black)}
                          </p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            Tap to pause
                          </p>
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    id="timer-white"
                    onClick={() => props.onSideTap('White')}
                    disabled={isEnded}
                    aria-label={`White ${props.activeSide === 'White' ? 'active' : 'inactive'} timer. ${formatMs(props.remainingMs.White)}. ${props.activeSide === 'White' ? 'Tap to pass turn.' : 'Tap to pause game.'}`}
                    className={`flex transition-all duration-200 ease-in-out ${
                      props.activeSide === 'White' ? 'flex-[3]' : 'flex-1'
                    } flex-col justify-center rounded-3xl px-4 ${props.activeSide === 'White' ? 'py-4' : 'py-3'} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      props.settings.highContrastMode
                        ? props.activeSide === 'White'
                          ? 'border-2 border-slate-950 bg-amber-200 text-slate-950 hover:bg-amber-300'
                          : 'border-2 border-slate-700 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : props.activeSide === 'White'
                          ? 'border border-orange-200 bg-orange-50 text-slate-900 hover:bg-orange-100'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {props.activeSide === 'White' ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em]">White (active)</p>
                        <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                          {formatMs(props.remainingMs.White)}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                          Tap to pass turn
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em]">White</p>
                        <p className={`mt-1 font-semibold tabular-nums text-slate-900 ${inactiveDigitSizeClass}`}>
                          {formatMs(props.remainingMs.White)}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                          Tap to pause
                        </p>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div
          id="game-controls"
          className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            hideChrome ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-40 opacity-100'
          }`}
        >
          {!isEnded && props.isPaused ? (
            <div
              id="game-pause-controls"
              className="mt-4 grid grid-cols-2 gap-2"
              role="group"
              aria-label="Paused game controls"
            >
              <Button
                variant="outline"
                onPress={props.onUndo}
                isDisabled={!props.canUndo}
                aria-label="Undo last turn switch"
                className="w-full border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <CornerDownLeft className="mr-2 size-4" />
                Undo
              </Button>
              <Button
                variant="outline"
                onPress={handleReset}
                aria-label="Reset game to initial time control"
                className="w-full border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <RotateCcw className="mr-2 size-4" />
                Reset
              </Button>
            </div>
          ) : null}

          {!isEnded ? (
            <div id="game-back-to-setup" className="pt-4">
              <Button
                variant="outline"
                onPress={props.onBackToSetup}
                aria-label="Return to setup screen"
                className="w-full border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              >
                Back to Setup
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {props.settingsDrawer}

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} isDismissable>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.Header>
                <AlertDialog.Heading className="text-lg font-semibold text-slate-900">
                  Reset game?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-slate-600">
                  This will reset the game and clear undo history. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex-col-reverse sm:flex-row">
                <Button slot="close" variant="tertiary" className="w-full sm:w-auto text-slate-700">
                  Cancel
                </Button>
                <Button slot="close" variant="danger" onPress={handleResetConfirm} className="w-full sm:w-auto">
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
