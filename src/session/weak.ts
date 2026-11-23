import type { DeckCard } from '../content/schema'
import type { AttemptLog, Progress } from '../storage/progress'
import { ROUND_SIZE } from './buildRound'

export type CardStat = {
  card: DeckCard
  /** Answers given (excluding "my answer was right" corrections). */
  attempts: number
  /** Wrong answers, minus those the learner overrode as right. */
  misses: number
  /** Times FSRS saw the card forgotten after it had been learned. */
  lapses: number
  /** FSRS stability in days; lower means more fragile memory. */
  stability: number
}

export function cardStats(cards: DeckCard[], progress: Progress, attempts: AttemptLog[]): CardStat[] {
  const byCard = new Map<string, AttemptLog[]>()
  for (const a of attempts) byCard.set(a.cardId, [...(byCard.get(a.cardId) ?? []), a])
  return cards
    .filter((c) => byCard.has(c.id) || progress.cards[c.id])
    .map((card) => {
      const logs = byCard.get(card.id) ?? []
      const overrides = logs.filter((a) => a.override).length
      const answers = logs.filter((a) => !a.override)
      return {
        card,
        attempts: answers.length,
        misses: Math.max(0, answers.filter((a) => !a.correct).length - overrides),
        lapses: progress.cards[card.id]?.lapses ?? 0,
        stability: progress.cards[card.id]?.stability ?? 0,
      }
    })
}

/** How weak a card is: share of misses plus a bit for each lapse. 0 means never missed. */
export function weakness(s: CardStat): number {
  return (s.attempts ? s.misses / s.attempts : 0) + s.lapses * 0.25
}

/** Practiced cards, weakest first; ties go to the least stable memory. */
export function rankWeakest(stats: CardStat[]): CardStat[] {
  return [...stats].sort((a, b) => weakness(b) - weakness(a) || b.misses - a.misses || a.stability - b.stability)
}

/** A round of the weakest cards. When fewer cards were ever missed, the least stable practiced cards fill it. */
export function weakestRound(cards: DeckCard[], progress: Progress, attempts: AttemptLog[], size = ROUND_SIZE): DeckCard[] {
  return rankWeakest(cardStats(cards, progress, attempts))
    .slice(0, size)
    .map((s) => s.card)
}
