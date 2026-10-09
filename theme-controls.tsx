'use client'

import { Check, Monitor, Moon, Palette, Sun, X } from 'lucide-react'
import { ACCENTS, isDarkActive, updateTheme, useTheme, type ThemeMode } from '@/lib/theme'
import { useHydrated } from '@/lib/transactions'

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: '端末に合わせる', icon: Monitor },
]

const iconButton =
  'flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'

export function ThemeControls() {
  const hydrated = useHydrated()
  const theme = useTheme()
  const dark = hydrated && isDarkActive(theme)

  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        className={iconButton}
        onClick={() => updateTheme({ mode: dark ? 'light' : 'dark' })}
        aria-label={dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      >
        {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </button>
      <button type="button" className={iconButton} popoverTarget="theme-panel" aria-label="デザイン設定を開く">
        <Palette className="size-4" aria-hidden="true" />
      </button>

      <div
        id="theme-panel"
        popover="auto"
        aria-label="デザイン設定"
        className="fixed inset-x-3 top-auto bottom-3 m-0 w-auto rounded-2xl border bg-popover p-5 text-popover-foreground shadow-xl backdrop:bg-black/40 sm:inset-x-auto sm:top-16 sm:right-4 sm:bottom-auto sm:w-80"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">デザイン設定</h2>
          <button
            type="button"
            popoverTarget="theme-panel"
            popoverTargetAction="hide"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-muted-foreground">表示モード</legend>
          <div className="mt-2 flex gap-2">
            {MODES.map(({ value, label, icon: Icon }) => {
              const active = hydrated && theme.mode === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateTheme({ mode: value })}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition ${
                    active
                      ? 'border-primary bg-accent font-bold text-accent-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-xs font-medium text-muted-foreground">テーマカラー</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ACCENTS.map(({ value, label, swatch }) => {
              const active = hydrated && theme.accent === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateTheme({ accent: value })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition ${
                    active ? 'border-primary bg-accent font-bold text-accent-foreground' : 'bg-card hover:bg-muted'
                  }`}
                >
                  <span
                    className="flex size-7 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: swatch }}
                    aria-hidden="true"
                  >
                    {active && <Check className="size-4" />}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <p className="mt-4 text-xs text-muted-foreground">設定はこの端末に保存されます。</p>
      </div>
    </div>
  )
}
