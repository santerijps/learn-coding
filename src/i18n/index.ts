import { fi, type Messages } from './fi'

/** The active UI language. Only Finnish exists for now; content in src/content/<locale> follows the same choice. */
export const m: Messages = fi

const relative = new Intl.RelativeTimeFormat(fi.locale, { numeric: 'auto' })

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
