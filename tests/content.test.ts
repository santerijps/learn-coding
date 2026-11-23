import { describe, expect, test } from 'bun:test'
import { Glob } from 'bun'
import { course } from '../src/content'
import { buildProgram, runProgram } from '../src/check/program'
import { matches, normalize } from '../src/check/normalize'

/**
 * Content checks: a broken card fails the build instead of reaching learners.
 * Every model answer must pass its own checker, and an empty answer must not.
 */

const run = (setup: string, code: string, tests: string[]) => runProgram(buildProgram(setup, code, tests))

describe('course structure', () => {
  test('every lesson file is listed in its track index', async () => {
    for (const track of course.tracks) {
      const files = [...new Glob('*.yaml').scanSync(`src/content/fi/${track.id}`)]
      expect(track.lessons.length).toBe(files.length)
    }
  })

  test('lesson and card ids are prefixed with their track', () => {
    for (const track of course.tracks) {
      for (const lesson of track.lessons) {
        expect(lesson.id.startsWith(`${track.id}-`)).toBe(true)
        for (const card of lesson.cards) expect(card.id.startsWith(`${track.id}-`)).toBe(true)
      }
    }
  })
})

for (const track of course.tracks) {
  for (const lesson of track.lessons) {
    describe(`${lesson.id}`, () => {
      for (const card of lesson.cards) {
        if (card.check === 'test') {
          test(`${card.id}: model answer passes`, async () => {
            expect(await run(card.setup, card.solution, card.tests)).toEqual(card.tests.map(() => true))
          })
          test(`${card.id}: empty answer fails`, async () => {
            expect((await run(card.setup, '', card.tests)).every(Boolean)).toBe(false)
          })
        } else {
          test(`${card.id}: accepted answers are distinct`, () => {
            const all = [card.solution, ...card.accepted].map((s) => normalize(s, track.language))
            expect(new Set(all).size).toBe(all.length)
            expect(matches(card.solution, [card.solution], track.language)).toBe(true)
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
