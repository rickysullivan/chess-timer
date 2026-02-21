import { Clock3, RotateCcw, Undo2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
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
  const { onDismissOnboarding } = props
  const inactiveSide = props.activeSide === 'White' ? 'Black' : 'White'
  const shouldShowOnboardingCue = props.settings.layoutMode === 'adaptive' && !props.onboardingSeen

  useEffect(() => {
    if (!shouldShowOnboardingCue) return

    const timer = window.setTimeout(() => {
      onDismissOnboarding()
    }, 3000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [onDismissOnboarding, shouldShowOnboardingCue])

  const startedHint = props.isPaused
    ? 'Game is paused. Resume when both players are ready.'
    : props.settings.layoutMode === 'adaptive'
      ? 'Tap your active side to switch. Tap the small strip to pause.'
      : 'Tap the active timer to switch. Tap Pause to stop the clock.'
  const activeIndicatorText = `${props.activeSide} to move`
  const timerGroupClass = props.settings.highContrastMode
    ? 'mt-3 flex gap-2 border-2 border-slate-900 bg-slate-50 p-2'
    : 'mt-3 flex gap-2'
  const pausedTimerCardClass = props.settings.highContrastMode
    ? 'rounded-lg border-2 border-slate-800 bg-white px-3 py-3 text-left'
    : 'rounded-lg border border-slate-200 bg-white px-3 py-3 text-left'
  const activeTimerClass = props.settings.highContrastMode
    ? 'flex-[4] rounded-xl border-2 border-slate-950 bg-amber-200 px-4 py-4 text-left text-slate-950 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    : 'flex-[4] rounded-xl border border-primary bg-orange-50 px-4 py-4 text-left text-slate-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const inactiveTimerClass = props.settings.highContrastMode
    ? 'flex-1 rounded-xl border-2 border-slate-700 bg-white px-4 py-3 text-left text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    : 'flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const pausedDigitSizeClass = props.settings.largeDigitsMode ? 'text-3xl md:text-4xl' : 'text-2xl'
  const activeDigitSizeClass = props.settings.largeDigitsMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
  const inactiveDigitSizeClass = props.settings.largeDigitsMode ? 'text-3xl md:text-4xl' : 'text-2xl'
  const isEnded = Boolean(props.timeoutSide)

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <Clock3 className="size-4" />
            chess-timer
          </div>
          {props.headerActions}
        </div>
        {props.actionMessage ? (
          <p
            className={`mb-3 text-sm ${
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

        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Game started.</h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">{startedHint}</p>
        {shouldShowOnboardingCue ? (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p>Tap your side to switch. Tap the small strip to pause.</p>
            <button
              type="button"
              onClick={props.onDismissOnboarding}
              aria-label="Dismiss onboarding tip"
              className="inline-flex items-center justify-center rounded-md border border-sky-300 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-800 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        {props.warningBanner}

        <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Active control</h2>

          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-lg font-semibold text-slate-900">{props.startedControl.label}</p>
            <p className="mt-1 text-sm text-slate-600">
              {props.startedControl.baseMinutes} min base, +{props.startedControl.incrementSeconds}s increment,
              {` `}
              {props.startedControl.delaySeconds}s delay
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {props.startedControl.source === 'preset' ? 'Preset control' : 'Custom control'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Timers</p>
            <p
              className={`mt-1 text-sm font-semibold ${props.settings.highContrastMode ? 'text-slate-950' : 'text-slate-700'}`}
              aria-live="polite"
            >
              {activeIndicatorText}
            </p>
            {props.activeDelayRemainingMs > 0 && !props.isPaused && !props.timeoutSide ? (
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500" aria-live="polite">
                Delay: {(props.activeDelayRemainingMs / 1000).toFixed(1)}s
              </p>
            ) : null}

            {isEnded ? (
              <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                Time Out
              </p>
            ) : null}

            {props.isPaused ? (
              <div className="mt-3 space-y-3" aria-live="polite">
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Paused timers">
                  <div className={`${pausedTimerCardClass} ${props.timeoutSide === 'White' ? 'opacity-45' : ''}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">White</p>
                    <p className={`mt-1 font-semibold tabular-nums text-slate-900 ${pausedDigitSizeClass}`}>
                      {formatMs(props.remainingMs.White)}
                    </p>
                    {props.timeoutSide === 'White' ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Time Out</p>
                    ) : null}
                  </div>
                  <div className={`${pausedTimerCardClass} ${props.timeoutSide === 'Black' ? 'opacity-45' : ''}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Black</p>
                    <p className={`mt-1 font-semibold tabular-nums text-slate-900 ${pausedDigitSizeClass}`}>
                      <span className="inline-block rotate-180">{formatMs(props.remainingMs.Black)}</span>
                    </p>
                    {props.timeoutSide === 'Black' ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Time Out</p>
                    ) : null}
                  </div>
                </div>

                {props.timeoutSide ? null : (
                  <Button
                    className="w-full"
                    onClick={props.onPauseResume}
                    aria-label={`Resume game with ${props.activeSide} to move`}
                  >
                    Resume ({props.activeSide} to move)
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={`${timerGroupClass} ${
                  props.settings.layoutMode === 'adaptive' ? 'h-[18rem] flex-col md:h-[14rem] md:flex-row' : 'h-[18rem] flex-col'
                }`}
                aria-live="polite"
              >
                <button
                  type="button"
                  onClick={() => props.onSideTap(props.activeSide)}
                  disabled={isEnded}
                  aria-label={`${props.activeSide} active timer. ${formatMs(props.remainingMs[props.activeSide])}. Tap to pass turn.`}
                  className={`${activeTimerClass} ${isEnded ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">{props.activeSide} (active)</p>
                  <p className={`mt-2 font-semibold tabular-nums ${activeDigitSizeClass}`}>
                    <span className={props.activeSide === 'Black' ? 'inline-block rotate-180' : undefined}>
                      {formatMs(props.remainingMs[props.activeSide])}
                    </span>
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-600">Tap to pass turn</p>
                </button>

                <button
                  type="button"
                  onClick={() => props.onSideTap(inactiveSide)}
                  disabled={isEnded}
                  aria-label={`${inactiveSide} inactive timer. ${formatMs(props.remainingMs[inactiveSide])}. Tap to pause game.`}
                  className={`${inactiveTimerClass} ${isEnded ? 'cursor-not-allowed opacity-60' : ''}`}
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

            {props.timeoutSide ? (
              <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                {props.timeoutSide} ran out of time.
              </p>
            ) : null}

            {isEnded ? (
              <div className="mt-4" role="group" aria-label="Game end controls">
                <Button className="w-full" variant="outline" onClick={props.onReset} aria-label="Reset game to initial time control">
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="In-game controls">
                <Button
                  variant="outline"
                  onClick={props.onPauseResume}
                  disabled={Boolean(props.timeoutSide)}
                  aria-label={props.isPaused ? 'Resume game' : 'Pause game'}
                >
                  {props.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" onClick={props.onUndo} disabled={!props.canUndo} aria-label="Undo last turn switch">
                  <Undo2 className="mr-2 size-4" />
                  Undo
                </Button>
                <Button variant="outline" onClick={props.onReset} aria-label="Reset game to initial time control">
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </section>

        <div className="mt-auto grid gap-3 pt-8">
          <Button onClick={props.onBackToSetup} aria-label="Return to setup screen" disabled={isEnded}>
            Back to Setup
          </Button>
        </div>
      </div>
      {props.settingsDrawer}
    </main>
  )
}
