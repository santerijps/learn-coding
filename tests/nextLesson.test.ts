import { expect, test } from 'bun:test'
import { nextLesson } from '../src/session/nextLesson'
import { emptyProgress } from '../src/storage/progress'
import type { Lesson } from '../src/content/schema'

const lessons = ['js-0', 'js-1', 'js-2'].map((id) => ({ id }) as Lesson)
const done = (...ids: string[]) => ({ ...emptyProgress(), lessons: Object.fromEntries(ids.map((id) => [id, '2026-01-01T00:00:00Z'])) })

test('suggests lesson 0 to a new learner', () => {
  expect(nextLesson(lessons, emptyProgress())?.id).toBe('js-0')
})

test('skips lesson 0 once a later lesson is done', () => {
  expect(nextLesson(lessons, done('js-1'))?.id).toBe('js-2')
  expect(nextLesson(lessons, done('js-1', 'js-2'))).toBeUndefined()
})

test('otherwise suggests the first lesson not done', () => {
  expect(nextLesson(lessons, done('js-0'))?.id).toBe('js-1')
  expect(nextLesson(lessons, done('js-0', 'js-2'))?.id).toBe('js-1')
})
