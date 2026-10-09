'use client'

import { useSyncExternalStore } from 'react'
import { THEME_STORAGE_KEY } from '@/lib/theme-script'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeAccent = 'mint' | 'ocean' | 'sakura' | 'sunset' | 'lavender' | 'mono'

export type ThemeSettings = { mode: ThemeMode; accent: ThemeAccent }

const DEFAULT_SETTINGS: ThemeSettings = { mode: 'system', accent: 'mint' }

export const ACCENTS: { value: ThemeAccent; label: string; swatch: string }[] = [
  { value: 'mint', label: 'ミント', swatch: 'oklch(0.55 0.08 175)' },
  { value: 'ocean', label: 'オーシャン', swatch: 'oklch(0.55 0.12 250)' },
  { value: 'sakura', label: 'サクラ', swatch: 'oklch(0.6 0.12 355)' },
  { value: 'sunset', label: 'サンセット', swatch: 'oklch(0.62 0.13 55)' },
  { value: 'lavender', label: 'ラベンダー', swatch: 'oklch(0.58 0.11 295)' },
  { value: 'mono', label: 'モノクロ', swatch: 'oklch(0.4 0 0)' },
]


const listeners = new Set<() => void>()
let cached: ThemeSettings | null = null

function read(): ThemeSettings {
  if (cached) return cached
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    cached = { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    cached = DEFAULT_SETTINGS
  }
  return cached!
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function apply(settings: ThemeSettings) {
  const root = document.documentElement
  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && darkQuery().matches)
  root.classList.toggle('dark', isDark)
  root.dataset.accent = settings.accent
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', isDark ? '#0d0d0d' : '#f8f6f1')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onSystemChange = () => apply(read())
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return
    cached = null
    apply(read())
    listener()
  }
  darkQuery().addEventListener('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    darkQuery().removeEventListener('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function updateTheme(patch: Partial<ThemeSettings>) {
  const next = { ...read(), ...patch }
  cached = next
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next))
  apply(next)
  listeners.forEach((l) => l())
}

export function isDarkActive(settings: ThemeSettings) {
  return settings.mode === 'dark' || (settings.mode === 'system' && darkQuery().matches)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS)
}
