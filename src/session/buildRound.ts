import type { DeckCard } from '../content/schema'
import type { Progress } from '../storage/progress'

export const ROUND_SIZE = 10
/** New cards may fill the whole round; every lesson has at least ROUND_SIZE cards. */
export const NEW_PER_ROUND = 10

/** Cards that can be practiced: those whose lesson the learner has completed. */
export function unlockedCards(deck: DeckCard[], progress: Progress): DeckCard[] {
  return deck.filter((c) => progress.lessons[c.lessonId])
}

export function dueCards(cards: DeckCard[], progress: Progress, now = new Date()): DeckCard[] {
  return cards
    .filter((c) => progress.cards[c.id] && progress.cards[c.id]!.due <= now)
    .sort((a, b) => +progress.cards[a.id]!.due - +progress.cards[b.id]!.due)
}

export function newCards(cards: DeckCard[], progress: Progress): DeckCard[] {
  return cards.filter((c) => !progress.cards[c.id])
}

/** The soonest upcoming review among cards that aren't due yet. */
export function nextDue(cards: DeckCard[], progress: Progress, now = new Date()): Date | undefined {
  const upcoming = cards.map((c) => progress.cards[c.id]?.due).filter((d): d is Date => !!d && d > now)
  return upcoming.length ? new Date(Math.min(...upcoming.map(Number))) : undefined
}

/**
 * Picks the cards for one round, from unlocked cards only:
 * due reviews first (most overdue first), then unseen cards in course order, then cards that
 * aren't due yet (soonest first) so a round always has ROUND_SIZE cards when enough are unlocked.
 * If nothing is due or new, the round is empty ("all caught up") unless `practiceAhead` is set.
 */
export function buildRound(cards: DeckCard[], progress: Progress, now = new Date(), practiceAhead = false): DeckCard[] {
  const due = dueCards(cards, progress, now).slice(0, ROUND_SIZE)
  const fresh = newCards(cards, progress).slice(0, Math.min(NEW_PER_ROUND, ROUND_SIZE - due.length))
  const round = [...due, ...fresh]
  if ((round.length > 0 || practiceAhead) && round.length < ROUND_SIZE) {
    const ahead = cards
      .filter((c) => progress.cards[c.id] && progress.cards[c.id]!.due > now)
      .sort((a, b) => +progress.cards[a.id]!.due - +progress.cards[b.id]!.due)
    round.push(...ahead.slice(0, ROUND_SIZE - round.length))
  }
  return round
}
