import { fi, type Messages } from './fi'
import { en } from './en'

export type Locale = 'fi' | 'en'
export const LOCALES: { id: Locale; name: string }[] = [
  { id: 'fi', name: 'Suomi' },
  { id: 'en', name: 'English' },
]

const MESSAGES: Record<Locale, Messages> = { fi, en }
const LOCALE_KEY = 'learn-coding.locale'

/**
 * The active UI strings. This is a live binding: `setMessagesLocale` swaps it, and the app
 * re-renders from the root (see src/app/locale.tsx), so every `m.*` read picks up the new language.
 */
export let m: Messages = fi
export let locale: Locale = 'fi'

let relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

const isLocale = (s: unknown): s is Locale => s === 'fi' || s === 'en'

/** A saved choice wins; otherwise Finnish for Finnish browsers and English for everyone else. */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // Storage blocked: fall through to the browser language.
  }
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of languages) {
    const base = lang?.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return 'en'
}

export function setMessagesLocale(next: Locale) {
  locale = next
  m = MESSAGES[next]
  relative = new Intl.RelativeTimeFormat(next, { numeric: 'auto' })
}

export function saveLocale(next: Locale) {
  try {
    localStorage.setItem(LOCALE_KEY, next)
  } catch {
    // The choice still applies for this visit.
  }
}

/** "in 5 minutes" / "tomorrow" style text for an upcoming date. */
export function formatRelative(date: Date, now = new Date()): string {
  const minutes = Math.round((+date - +now) / 60000)
  if (Math.abs(minutes) < 60) return relative.format(Math.max(minutes, 1), 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  return relative.format(Math.round(hours / 24), 'day')
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
