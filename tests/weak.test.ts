import { describe, expect, test } from 'bun:test'
import { cardStats, rankWeakest, weakestRound } from '../src/session/weak'
import { emptyProgress, type AttemptLog } from '../src/storage/progress'
import { newCard } from '../src/srs/scheduler'
import { shuffle } from '../src/pages/ChallengePage'
import type { DeckCard } from '../src/content/schema'

const card = (id: string): DeckCard =>
  ({ id, lessonId: 'js-a', lessonTitle: 'A', track: 'js', language: 'js', check: 'match', prompt: 'p', solution: 's', accepted: [] }) as DeckCard

const log = (cardId: string, correct: boolean, override = false): AttemptLog => ({
  cardId,
  answer: '',
  correct,
  ms: 1000,
  usedHint: false,
  override,
  at: '2026-01-01T00:00:00Z',
})

describe('weak cards', () => {
  const deck = ['a', 'b', 'c', 'd'].map(card)

  test('counts misses and treats overridden misses as correct', () => {
    const stats = cardStats(deck, emptyProgress(), [log('a', false), log('a', true, true), log('a', false), log('a', true)])
    expect(stats).toHaveLength(1)
    expect(stats[0]).toMatchObject({ attempts: 3, misses: 1 })
  })

  test('ranks by miss rate, then lapses and stability', () => {
    const progress = emptyProgress()
    progress.cards.d = { ...newCard(), stability: 0.5, lapses: 0 }
    progress.cards.c = { ...newCard(), stability: 9, lapses: 0 }
    const attempts = [log('a', false), log('a', true), log('b', false), log('b', false), log('c', true)]
    expect(rankWeakest(cardStats(deck, progress, attempts)).map((s) => s.card.id)).toEqual(['b', 'a', 'd', 'c'])
  })

  test('a weak round only contains practiced cards', () => {
    expect(weakestRound(deck, emptyProgress(), [log('c', false)]).map((c) => c.id)).toEqual(['c'])
    expect(weakestRound(deck, emptyProgress(), [])).toEqual([])
  })
})

test('shuffle keeps every item exactly once', () => {
  const items = Array.from({ length: 50 }, (_, i) => i)
  expect([...shuffle(items)].sort((a, b) => a - b)).toEqual(items)
})
