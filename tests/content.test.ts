import { describe, expect, test } from 'bun:test'
import { Glob } from 'bun'
import { courses } from '../src/content'
import type { DeckCard } from '../src/content/schema'
import { matches, normalize } from '../src/check/normalize'
import { ROUND_SIZE } from '../src/session/buildRound'
import { runJs, runPythonBatch, type RunResult } from './runners'

/**
 * Content checks: a broken card fails the build instead of reaching learners.
 * Every model answer must pass its own checker, and an empty answer must not.
 * Every language has the same lessons and cards, so progress carries over between them.
 */

const locales = Object.keys(courses) as (keyof typeof courses)[]

// Python cards run in one python3 process up front: model answer and empty answer for each.
const pythonCards = locales.flatMap((l) => courses[l].deck.filter((c): c is Extract<DeckCard, { check: 'test' }> => c.check === 'test' && c.language === 'python').map((c) => ({ l, c })))
const pythonRuns = runPythonBatch(pythonCards.flatMap(({ c }) => [{ setup: c.setup, code: c.solution, tests: c.tests }, { setup: c.setup, code: '', tests: c.tests }]))
const pythonResult = new Map<string, { solution: RunResult; empty: RunResult }>(
  pythonCards.map(({ l, c }, i) => [`${l}:${c.id}`, { solution: pythonRuns[2 * i]!, empty: pythonRuns[2 * i + 1]! }]),
)

async function run(locale: string, card: Extract<DeckCard, { check: 'test' }>, which: 'solution' | 'empty'): Promise<RunResult> {
  if (card.language === 'python') return pythonResult.get(`${locale}:${card.id}`)![which]
  return runJs(card.setup, which === 'solution' ? card.solution : '', card.tests)
}

describe('languages', () => {
  test('every language has the same tracks, lessons and cards in the same order', () => {
    const shape = (l: (typeof locales)[number]) =>
      courses[l].tracks.map((t) => ({
        track: t.id,
        language: t.language,
        lessons: t.lessons.map((lesson) => ({
          id: lesson.id,
          cards: lesson.cards.map((c) => `${c.id}:${c.check}`),
          exercises: lesson.exercises.map((e) => e.type),
        })),
      }))
    for (const l of locales) expect(shape(l)).toEqual(shape('fi'))
  })
})

for (const locale of locales) {
  const course = courses[locale]

  describe(`${locale}: course structure`, () => {
    test('every lesson file is listed in its track index', () => {
      for (const track of course.tracks) {
        const files = [...new Glob('*.yaml').scanSync(`src/content/${locale}/${track.id}`)]
        expect([track.id, track.lessons.length]).toEqual([track.id, files.length])
      }
    })

    test('every lesson has enough cards for a full round', () => {
      for (const track of course.tracks) {
        for (const lesson of track.lessons) expect([lesson.id, lesson.cards.length >= ROUND_SIZE]).toEqual([lesson.id, true])
      }
    })

    test('lesson and card ids are prefixed with their track', () => {
      for (const track of course.tracks) {
        for (const lesson of track.lessons) {
          expect(lesson.id.startsWith(`${track.id}-`)).toBe(true)
          for (const card of lesson.cards) expect([card.id, card.id.startsWith(`${track.id}-`)]).toEqual([card.id, true])
        }
      }
    })
  })

  for (const track of course.tracks) {
    for (const lesson of track.lessons) {
      describe(`${locale}: ${lesson.id}`, () => {
        for (const card of lesson.cards) {
          if (card.check === 'test') {
            const deckCard = course.cardById.get(card.id) as Extract<DeckCard, { check: 'test' }>
            test(`${card.id}: model answer passes`, async () => {
              const r = await run(locale, deckCard, 'solution')
              expect(r).toEqual({ ok: true, results: card.tests.map(() => true) })
            })
            test(`${card.id}: empty answer fails`, async () => {
              const r = await run(locale, deckCard, 'empty')
              expect(r.ok && r.results.every(Boolean)).toBe(false)
            })
          } else {
            test(`${card.id}: accepted answers are distinct`, () => {
              const language = card.language ?? track.language
              const all = [card.solution, ...card.accepted].map((s) => normalize(s, language))
              expect(new Set(all).size).toBe(all.length)
              expect(matches(card.solution, [card.solution], language)).toBe(true)
            })
          }
        }

        lesson.exercises.forEach((ex, i) => {
          test(`exercise ${i + 1} (${ex.type}) is well-formed`, () => {
            if (ex.type === 'choice') {
              expect(ex.answer).toBeLessThan(ex.options.length)
              expect(new Set(ex.options).size).toBe(ex.options.length)
            }
            if (ex.type === 'blank') {
              expect(ex.code.split('___').length - 1).toBe(ex.blanks.length)
            }
            if (ex.type === 'bug') {
              expect(ex.bugLine).toBeLessThanOrEqual(ex.code.replace(/\n$/, '').split('\n').length)
            }
          })
        })
      })
    }
  }
}
