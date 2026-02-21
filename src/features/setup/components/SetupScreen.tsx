import { Check, Clock3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { PRESETS, type ActionMessageTone, type ControlSource, type TimeControl } from '@/app/types'

type SetupScreenProps = {
  headerActions: ReactNode
  warningBanner: ReactNode
  settingsDrawer: ReactNode
  actionMessage: { tone: ActionMessageTone; text: string } | null
  liveAnnouncement: string
  controlSource: ControlSource
  selectedPreset: string
  customBaseMinutes: string
  customIncrementSeconds: string
  customDelaySeconds: string
  showCustomBaseError: string | false | null
  showCustomIncrementError: string | false | null
  showCustomDelayError: string | false | null
  selectedControl: TimeControl | null
  startError: string | null
  attemptedStart: boolean
  canStart: boolean
  onControlSourceChange: (source: ControlSource) => void
  onPresetSelect: (presetId: string) => void
  onCustomBaseMinutesChange: (value: string) => void
  onCustomIncrementSecondsChange: (value: string) => void
  onCustomDelaySecondsChange: (value: string) => void
  onCustomBaseBlur: () => void
  onCustomIncrementBlur: () => void
  onCustomDelayBlur: () => void
  onStart: () => void
}

export function SetupScreen(props: SetupScreenProps) {
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

        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Pick a preset and start in seconds.
        </h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          Clean, focused, and built for fast over-the-board play.
        </p>
        {props.warningBanner}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Control type
          </h2>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Time control type">
            <button
              type="button"
              onClick={() => props.onControlSourceChange('preset')}
              aria-pressed={props.controlSource === 'preset'}
              aria-label="Use preset time controls"
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                props.controlSource === 'preset'
                  ? 'border-primary bg-orange-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Preset
            </button>
            <button
              type="button"
              onClick={() => props.onControlSourceChange('custom')}
              aria-pressed={props.controlSource === 'custom'}
              aria-label="Use custom time controls"
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                props.controlSource === 'custom'
                  ? 'border-primary bg-orange-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Custom
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Presets</h2>

          <div className="grid gap-2" role="listbox" aria-label="Time control presets">
            {PRESETS.map((preset) => {
              const isSelected = preset.id === props.selectedPreset

              return (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Select preset ${preset.label}, ${preset.description}`}
                  onClick={() => props.onPresetSelect(preset.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? 'border-primary bg-orange-50 ring-1 ring-primary/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>
                    <span className="block text-lg font-semibold text-slate-900">{preset.label}</span>
                    <span className="block text-xs text-slate-500">{preset.description}</span>
                  </span>

                  {isSelected ? (
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <span className="size-7 rounded-full border border-slate-200" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Custom time control">
          <h2 className="pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Custom control</h2>

          <div className="grid gap-4">
            <div>
              <label htmlFor="base-minutes" className="block text-sm font-medium text-slate-700">
                Base minutes
              </label>
              <input
                id="base-minutes"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={props.customBaseMinutes}
                onChange={(event) => props.onCustomBaseMinutesChange(event.target.value)}
                onBlur={props.onCustomBaseBlur}
                aria-invalid={Boolean(props.showCustomBaseError)}
                aria-describedby={props.showCustomBaseError ? 'base-minutes-error' : undefined}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {props.showCustomBaseError ? (
                <p id="base-minutes-error" className="mt-1 text-sm text-red-600">
                  {props.showCustomBaseError}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="increment-seconds" className="block text-sm font-medium text-slate-700">
                Increment seconds
              </label>
              <input
                id="increment-seconds"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={props.customIncrementSeconds}
                onChange={(event) => props.onCustomIncrementSecondsChange(event.target.value)}
                onBlur={props.onCustomIncrementBlur}
                aria-invalid={Boolean(props.showCustomIncrementError)}
                aria-describedby={props.showCustomIncrementError ? 'increment-seconds-error' : undefined}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {props.showCustomIncrementError ? (
                <p id="increment-seconds-error" className="mt-1 text-sm text-red-600">
                  {props.showCustomIncrementError}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="delay-seconds" className="block text-sm font-medium text-slate-700">
                Delay seconds
              </label>
              <input
                id="delay-seconds"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={props.customDelaySeconds}
                onChange={(event) => props.onCustomDelaySecondsChange(event.target.value)}
                onBlur={props.onCustomDelayBlur}
                aria-invalid={Boolean(props.showCustomDelayError)}
                aria-describedby={props.showCustomDelayError ? 'delay-seconds-error' : undefined}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {props.showCustomDelayError ? (
                <p id="delay-seconds-error" className="mt-1 text-sm text-red-600">
                  {props.showCustomDelayError}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-auto pt-8">
          <Button
            className="w-full"
            size="lg"
            onClick={props.onStart}
            disabled={!props.canStart}
            aria-label={props.selectedControl ? `Start game with ${props.selectedControl.label}` : 'Start game'}
          >
            {props.selectedControl ? `Start ${props.selectedControl.label}` : 'Start Game'}
          </Button>
          {(props.attemptedStart || props.controlSource === 'custom') && props.startError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {props.startError}
            </p>
          ) : null}
        </div>
      </div>
      {props.settingsDrawer}
    </main>
  )
}
