import type { ReactNode } from 'react'
import { Button } from '@heroui/react'
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
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/icons/zugzwang-mark.svg"
              alt=""
              aria-hidden="true"
              className="size-8 rounded-lg shadow-sm"
            />
            <p className="text-base font-bold tracking-tight text-slate-950">Zugzwang</p>
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
          Every second counts.
        </h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          A simple chess timer for over-the-board play.
        </p>
        {props.warningBanner}

        <section className="mt-6" aria-label="Time control selection">
          <div className="grid grid-cols-3 gap-2" role="listbox" aria-label="Time control presets">
            {PRESETS.map((preset) => {
              const isSelected = props.controlSource === 'preset' && preset.id === props.selectedPreset

              return (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Select preset ${preset.label}, ${preset.description}`}
                  onClick={() => props.onPresetSelect(preset.id)}
                  className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition ${
                    isSelected
                      ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-300/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg font-semibold text-slate-900">{preset.label}</span>
                  <span className="text-xs text-slate-500">{preset.description}</span>
                </button>
              )
            })}

            <button
              type="button"
              role="option"
              aria-selected={props.controlSource === 'custom'}
              aria-label="Use custom time controls"
              onClick={() => props.onControlSourceChange('custom')}
              className={`flex items-center justify-center rounded-xl border px-2 py-3 text-center transition ${
                props.controlSource === 'custom'
                  ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-300/40'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="text-sm font-semibold text-slate-700">Custom</span>
            </button>
          </div>

          {props.controlSource === 'custom' ? (
            <div className="mt-3 animate-fade-in rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Custom time control">
              <div className="grid gap-4">
                <div>
                  <label htmlFor="base-minutes" className="block text-sm font-medium text-slate-700">
                    Base minutes
                  </label>
                  <input
                    id="base-minutes"
                    type="number"
                    min={0}
                    step={1}
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
                    step={1}
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
                    step={1}
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
            </div>
          ) : null}
        </section>

        <div className="mt-auto pt-8">
          <Button
            className="h-14 w-full text-lg font-semibold"
            onPress={props.onStart}
            isDisabled={!props.canStart}
            aria-label={props.selectedControl ? `Start game with ${props.selectedControl.label}` : 'Start game'}
          >
            Start
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
