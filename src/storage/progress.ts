import type { FsrsCard } from '../srs/scheduler'

/**
 * All persistence goes through this module. It uses localStorage for now; moving progress to a
 * server later only means reimplementing these functions.
 */

export type Progress = {
  version: 1
  /** Spaced-repetition state per card id. A card is in the deck once it has an entry here. */
  cards: Record<string, FsrsCard>
  /** Completed lessons: lesson id → ISO timestamp. Only completed lessons' cards are practiced. */
  lessons: Record<string, string>
  /** Consecutive days with at least one finished practice round. `day` is a local YYYY-MM-DD date. */
  streak: { day: string; count: number } | null
}

export type AttemptLog = {
  cardId: string
  answer: string
  correct: boolean
  ms: number
  usedHint: boolean
  /** The learner pressed "my answer was right": the checker was too strict for this answer. */
  override: boolean
  error?: string
  at: string
}

const PROGRESS_KEY = 'learn-coding.progress.v1'
const ATTEMPTS_KEY = 'learn-coding.attempts.v1'
/** Keep the attempt log bounded so localStorage never fills up. */
const MAX_ATTEMPTS = 5000

export function emptyProgress(): Progress {
  return { version: 1, cards: {}, lessons: {}, streak: null }
}

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage is full or blocked (e.g. a private window): the app keeps working without saving.
  }
}

function reviveCard(c: FsrsCard): FsrsCard {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined }
}

export function loadProgress(): Progress {
  const stored = read(PROGRESS_KEY) as Partial<Progress> | undefined
  if (!stored || stored.version !== 1) return emptyProgress()
  return {
    version: 1,
    cards: Object.fromEntries(Object.entries(stored.cards ?? {}).map(([id, c]) => [id, reviveCard(c)])),
    lessons: stored.lessons ?? {},
    streak: stored.streak ?? null,
  }
}

export function saveProgress(p: Progress) {
  write(PROGRESS_KEY, p)
}

export function loadAttempts(): AttemptLog[] {
  const stored = read(ATTEMPTS_KEY)
  return Array.isArray(stored) ? (stored as AttemptLog[]) : []
}

export function logAttempt(a: AttemptLog) {
  write(ATTEMPTS_KEY, [...loadAttempts(), a].slice(-MAX_ATTEMPTS))
}

export function resetAll() {
  try {
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(ATTEMPTS_KEY)
  } catch {
    // ignore
  }
}

// ---------- Streak ----------

export function localDay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function previousDay(d: Date): string {
  const y = new Date(d)
  y.setDate(y.getDate() - 1)
  return localDay(y)
}

/** Records a finished round today. */
export function bumpStreak(streak: Progress['streak'], now = new Date()): NonNullable<Progress['streak']> {
  const today = localDay(now)
  if (streak?.day === today) return streak
  if (streak?.day === previousDay(now)) return { day: today, count: streak.count + 1 }
  return { day: today, count: 1 }
}

/** The streak as shown: still alive if the last round was today or yesterday. */
export function currentStreak(streak: Progress['streak'], now = new Date()): number {
  if (!streak) return 0
  return streak.day === localDay(now) || streak.day === previousDay(now) ? streak.count : 0
}
