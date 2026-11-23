import { z } from 'zod'

const id = z.string().regex(/^[a-z0-9-]+$/, 'ids are lowercase-kebab-case')

// ---------- Rapid-fire cards (the spaced-repetition deck) ----------

const cardBase = {
  id,
  /** Inline markdown: `code` and **bold**. */
  prompt: z.string().min(1),
  /** The model answer: shown after a miss and retyped by the learner. */
  solution: z.string().min(1),
  hint: z.string().optional(),
}

/** The answer is normalized and compared against `solution` plus any `accepted` variants. */
const matchCard = z.strictObject({
  ...cardBase,
  check: z.literal('match'),
  accepted: z.array(z.string().min(1)).default([]),
})

/**
 * The answer runs after `setup`; every expression in `tests` must be truthy. Tests are written in
 * the track's language. JavaScript tests can read `__logs` (console.log output as strings) and
 * `__raw` (the raw console.log arguments); Python tests can read `__logs` (printed lines).
 */
const testCard = z.strictObject({
  ...cardBase,
  check: z.literal('test'),
  setup: z.string().default(''),
  tests: z.array(z.string().min(1)).min(1),
})

export const cardSchema = z.discriminatedUnion('check', [matchCard, testCard])

// ---------- Exercises that check understanding of a lesson ----------

const exerciseBase = {
  question: z.string().min(1),
  /** Shown after a wrong answer, and after the answer is revealed. */
  explanation: z.string().min(1),
}

const choiceExercise = z.strictObject({
  ...exerciseBase,
  type: z.literal('choice'),
  code: z.string().optional(),
  options: z.array(z.string().min(1)).min(2),
  /** Index of the correct option. */
  answer: z.number().int().min(0),
})

/** `code` contains one `___` per blank; `blanks[i]` lists the accepted answers for blank i. */
const blankExercise = z.strictObject({
  ...exerciseBase,
  type: z.literal('blank'),
  code: z.string().min(1),
  blanks: z.array(z.array(z.string().min(1)).min(1)).min(1),
})

/** The learner picks the line that contains the bug. `bugLine` is 1-based. */
const bugExercise = z.strictObject({
  ...exerciseBase,
  type: z.literal('bug'),
  code: z.string().min(1),
  bugLine: z.number().int().min(1),
})

export const exerciseSchema = z.discriminatedUnion('type', [choiceExercise, blankExercise, bugExercise])

// ---------- Lessons and tracks ----------

export const lessonSchema = z.strictObject({
  id,
  title: z.string().min(1),
  summary: z.string().min(1),
  /** Block markdown: paragraphs, `###` headings, `-` lists and fenced code blocks. */
  theory: z.string().min(1),
  exercises: z.array(exerciseSchema).min(1),
  cards: z.array(cardSchema).min(1),
})

export type TrackId = 'js' | 'py' | 'git'
export const TRACK_IDS: TrackId[] = ['js', 'py', 'git']
/** `js` and `python` answers are normalized as code (and test cards run in that language), `shell` answers as terminal commands. */
export type AnswerLanguage = 'js' | 'python' | 'shell'

export type Card = z.infer<typeof cardSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type Lesson = z.infer<typeof lessonSchema>

export type Track = {
  id: TrackId
  title: string
  description: string
  language: AnswerLanguage
  lessons: Lesson[]
}

/** A card plus where it comes from, as the practice engine uses it. */
export type DeckCard = Card & { lessonId: string; lessonTitle: string; track: TrackId; language: AnswerLanguage }
