import { Drawer, Switch } from '@heroui/react'
import type { AppSettings } from '@/app/types'

type SettingsDrawerProps = {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

export function SettingsDrawer(props: SettingsDrawerProps) {
  const { isOpen, onClose, onUpdateSetting, settings } = props

  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onClose} isDismissable>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className="rounded-t-2xl">
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Settings</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <div className="space-y-3">
                <Switch
                  isSelected={settings.sound}
                  onChange={() => onUpdateSetting('sound', !settings.sound)}
                  aria-label="Sound"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Sound
                  </Switch.Content>
                </Switch>

                <Switch
                  isSelected={settings.vibration}
                  onChange={() => onUpdateSetting('vibration', !settings.vibration)}
                  aria-label="Vibration"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Vibration
                  </Switch.Content>
                </Switch>

                <Switch
                  isSelected={settings.keepScreenAwake}
                  onChange={() => onUpdateSetting('keepScreenAwake', !settings.keepScreenAwake)}
                  aria-label="Keep screen awake"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Keep screen awake
                  </Switch.Content>
                </Switch>

                <Switch
                  isSelected={settings.highContrastMode}
                  onChange={() => onUpdateSetting('highContrastMode', !settings.highContrastMode)}
                  aria-label="High-contrast mode"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    High-contrast mode
                  </Switch.Content>
                </Switch>

                <Switch
                  isSelected={settings.largeDigitsMode}
                  onChange={() => onUpdateSetting('largeDigitsMode', !settings.largeDigitsMode)}
                  aria-label="Large digits mode"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Large digits mode
                  </Switch.Content>
                </Switch>

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
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
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
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Classic
                    </button>
                  </div>
                </div>
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}