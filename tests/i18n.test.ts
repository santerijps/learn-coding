import { afterEach, expect, test } from 'bun:test'
import { fi } from '../src/i18n/fi'
import { en } from '../src/i18n/en'
import { m, setMessagesLocale } from '../src/i18n'
import { course, courses, setCourseLocale } from '../src/content'

afterEach(() => {
  setMessagesLocale('fi')
  setCourseLocale('fi')
})

test('every language defines every UI string', () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(fi).sort())
})

test('switching the language swaps the live UI strings and course', () => {
  setMessagesLocale('en')
  setCourseLocale('en')
  expect(m.appName).toBe('Code School')
  expect(course).toBe(courses.en)
  setMessagesLocale('fi')
  setCourseLocale('fi')
  expect(m.appName).toBe('Koodikoulu')
  expect(course).toBe(courses.fi)
})
