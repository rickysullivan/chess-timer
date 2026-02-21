import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AppSettings } from '@/app/types'

type SettingsDrawerProps = {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

export function SettingsDrawer(props: SettingsDrawerProps) {
  const { isOpen, onClose, onUpdateSetting, settings } = props
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close settings"
        className="fixed inset-0 z-40 bg-slate-950/35"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-drawer-title"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="mx-auto w-full max-w-xl px-5 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 id="settings-drawer-title" className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Settings
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Close settings drawer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <SettingToggle
              label="Sound"
              value={settings.sound}
              onChange={() => onUpdateSetting('sound', !settings.sound)}
            />
            <SettingToggle
              label="Vibration"
              value={settings.vibration}
              onChange={() => onUpdateSetting('vibration', !settings.vibration)}
            />
            <SettingToggle
              label="Keep screen awake"
              value={settings.keepScreenAwake}
              onChange={() => onUpdateSetting('keepScreenAwake', !settings.keepScreenAwake)}
            />
            <SettingToggle
              label="High-contrast mode"
              value={settings.highContrastMode}
              onChange={() => onUpdateSetting('highContrastMode', !settings.highContrastMode)}
            />
            <SettingToggle
              label="Large digits mode"
              value={settings.largeDigitsMode}
              onChange={() => onUpdateSetting('largeDigitsMode', !settings.largeDigitsMode)}
            />

            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm font-medium text-slate-800">Layout mode</p>
              <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Layout mode">
                <button
                  type="button"
                  onClick={() => onUpdateSetting('layoutMode', 'adaptive')}
                  aria-pressed={settings.layoutMode === 'adaptive'}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    settings.layoutMode === 'adaptive'
                      ? 'border-primary bg-orange-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  Adaptive
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSetting('layoutMode', 'classic')}
                  aria-pressed={settings.layoutMode === 'classic'}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    settings.layoutMode === 'classic'
                      ? 'border-primary bg-orange-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  Classic
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

type SettingToggleProps = {
  label: string
  value: boolean
  onChange: () => void
}

function SettingToggle(props: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-sm font-medium text-slate-800">{props.label}</p>
      <button
        type="button"
        onClick={props.onChange}
        aria-label={`${props.label} ${props.value ? 'on' : 'off'}`}
        aria-pressed={props.value}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          props.value ? 'border-primary bg-orange-50 text-slate-900' : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        {props.value ? 'On' : 'Off'}
      </button>
    </div>
  )
}
