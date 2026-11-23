import { describe, expect, test } from 'bun:test'
import { fastThresholdMs, gradeAttempt, newCard, Rating, review } from '../src/srs/scheduler'
import { buildRound, dueCards, NEW_PER_ROUND, nextDue, ROUND_SIZE, unlockedCards } from '../src/session/buildRound'
import { bumpStreak, currentStreak, emptyProgress, type Progress } from '../src/storage/progress'
import type { DeckCard } from '../src/content/schema'

const base = { correct: true, usedHint: false, ms: 10_000, solutionLength: 20, seenBefore: true }

describe('gradeAttempt', () => {
  test('wrong is Again', () => expect(gradeAttempt({ ...base, correct: false })).toBe(Rating.Again))
  test('hint is Hard', () => expect(gradeAttempt({ ...base, usedHint: true })).toBe(Rating.Hard))
  test('fast recall of a known card is Easy', () => expect(gradeAttempt({ ...base, ms: 1000 })).toBe(Rating.Easy))
  test('a new card is never Easy', () => expect(gradeAttempt({ ...base, ms: 1000, seenBefore: false })).toBe(Rating.Good))
  test('slow correct is Good', () => expect(gradeAttempt({ ...base, ms: fastThresholdMs(20) + 1 })).toBe(Rating.Good))
})

describe('review', () => {
  test('a correct answer pushes the card further out than a wrong one', () => {
    const now = new Date('2026-01-01T12:00:00Z')
    const good = review(newCard(now), Rating.Good, now)
    const again = review(newCard(now), Rating.Again, now)
    expect(+good.due).toBeGreaterThan(+again.due)
  })
})

const card = (id: string, lessonId = 'js-a'): DeckCard =>
  ({ id, lessonId, lessonTitle: 'A', track: 'js', language: 'js', check: 'match', prompt: 'p', solution: 's', accepted: [] }) as DeckCard

const now = new Date('2026-03-10T12:00:00Z')
const at = (offsetMin: number) => ({ ...newCard(now), due: new Date(+now + offsetMin * 60000), reps: 1 })

describe('buildRound', () => {
  const deck = Array.from({ length: 20 }, (_, i) => card(`c${i}`))
  const progress = (cards: Progress['cards']): Progress => ({ ...emptyProgress(), lessons: { 'js-a': 'x' }, cards })

  test('only cards from completed lessons are unlocked', () => {
    const mixed = [card('a', 'js-a'), card('b', 'js-b')]
    expect(unlockedCards(mixed, progress({})).map((c) => c.id)).toEqual(['a'])
  })

  test('due cards come first, most overdue first, then new cards', () => {
    const p = progress({ c5: at(-5), c6: at(-60), c7: at(30) })
    const round = buildRound(deck, p, now)
    expect(round.slice(0, 2).map((c) => c.id)).toEqual(['c6', 'c5'])
    expect(round.length).toBe(ROUND_SIZE)
    expect(round.slice(2).every((c) => !p.cards[c.id])).toBe(true)
    expect(NEW_PER_ROUND).toBeLessThanOrEqual(ROUND_SIZE)
  })

  test('a round is topped up with not-yet-due cards to always have ROUND_SIZE cards', () => {
    const small = deck.slice(0, 12)
    const cards = Object.fromEntries(small.map((c, i) => [c.id, i === 0 ? at(-1) : at(i)]))
    const round = buildRound(small, progress(cards), now)
    expect(round.length).toBe(ROUND_SIZE)
    expect(round.map((c) => c.id).slice(0, 3)).toEqual(['c0', 'c1', 'c2'])
  })

  test('rounds never exceed the round size', () => {
    const cards = Object.fromEntries(deck.map((c) => [c.id, at(-1)]))
    expect(buildRound(deck, progress(cards), now).length).toBe(ROUND_SIZE)
  })

  test('practice ahead fills the round with upcoming cards', () => {
    const cards = Object.fromEntries(deck.map((c, i) => [c.id, at(i + 1)]))
    const p = progress(cards)
    expect(buildRound(deck, p, now)).toEqual([])
    expect(buildRound(deck, p, now, true).map((c) => c.id)[0]).toBe('c0')
    expect(dueCards(deck, p, now)).toEqual([])
    expect(nextDue(deck, p, now)).toEqual(cards.c0!.due)
  })
})

describe('streak', () => {
  const day = (s: string) => new Date(`${s}T12:00:00`)

  test('continues on consecutive days and restarts after a gap', () => {
    let s = bumpStreak(null, day('2026-03-01'))
    s = bumpStreak(s, day('2026-03-01'))
    expect(s.count).toBe(1)
    s = bumpStreak(s, day('2026-03-02'))
    expect(s.count).toBe(2)
    s = bumpStreak(s, day('2026-03-05'))
    expect(s.count).toBe(1)
  })

  test('is shown until the end of the next day', () => {
    const s = { day: '2026-03-01', count: 4 }
    expect(currentStreak(s, day('2026-03-02'))).toBe(4)
    expect(currentStreak(s, day('2026-03-03'))).toBe(0)
  })
})
