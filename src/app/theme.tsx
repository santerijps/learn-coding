import { useState } from 'react'
import { m } from '../i18n'

/** `auto` follows the operating system; the others force a theme. */
export type Theme = 'auto' | 'light' | 'dark'

/** Must match the inline script in index.html, which applies the theme before the first paint. */
export const THEME_KEY = 'learn-coding.theme'

const ORDER: Theme[] = ['auto', 'light', 'dark']
const ICON: Record<Theme, string> = { auto: '🌓', light: '☀️', dark: '🌙' }

export function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

/** The CSS reads `data-theme` on <html>; without it, the system preference applies. */
export function applyTheme(theme: Theme) {
  if (theme === 'auto') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
  try {
    if (theme === 'auto') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
}

export function nextTheme(theme: Theme): Theme {
  return ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(loadTheme)
  const label = m.themeName[theme]
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        const next = nextTheme(theme)
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={m.themeSwitch(label, m.themeName[nextTheme(theme)])}
      title={m.themeSwitch(label, m.themeName[nextTheme(theme)])}
    >
      <span aria-hidden="true">{ICON[theme]}</span>
      <span className="theme-label">{label}</span>
    </button>
  )
}
