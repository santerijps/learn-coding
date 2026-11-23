import { createEmptyCard, fsrs, Rating, type Card as FsrsCard, type Grade } from 'ts-fsrs'

export { Rating }
export type { FsrsCard, Grade }

const scheduler = fsrs({ enable_fuzz: true })

export type AttemptSummary = {
  correct: boolean
  usedHint: boolean
  ms: number
  solutionLength: number
  /** Whether the learner had reviewed this card before. Brand-new cards are never graded Easy. */
  seenBefore: boolean
}

/** Answers this fast count as effortless recall: 3 s plus 150 ms per character of the model answer. */
export function fastThresholdMs(solutionLength: number): number {
  return 3000 + solutionLength * 150
}

/**
 * Grades an attempt automatically, so learners never rate themselves:
 * wrong → Again, correct with a hint → Hard, fast recall of a known card → Easy, otherwise Good.
 */
export function gradeAttempt(a: AttemptSummary): Grade {
  if (!a.correct) return Rating.Again
  if (a.usedHint) return Rating.Hard
  if (a.seenBefore && a.ms <= fastThresholdMs(a.solutionLength)) return Rating.Easy
  return Rating.Good
}

export function newCard(now = new Date()): FsrsCard {
  return createEmptyCard(now)
}

export function review(card: FsrsCard, grade: Grade, now = new Date()): FsrsCard {
  return scheduler.next(card, now, grade).card
}
