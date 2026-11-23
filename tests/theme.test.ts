import { expect, test } from 'bun:test'
import { nextTheme } from '../src/app/theme'

test('the theme switch cycles auto → light → dark → auto', () => {
  expect(nextTheme('auto')).toBe('light')
  expect(nextTheme('light')).toBe('dark')
  expect(nextTheme('dark')).toBe('auto')
})
