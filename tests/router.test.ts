import { expect, test } from 'bun:test'
import { href, parseRoute, type Route } from '../src/app/router'

test('routes round-trip through their hash', () => {
  const routes: Route[] = [
    { name: 'home' },
    { name: 'track', track: 'js' },
    { name: 'lesson', lessonId: 'js-muuttujat' },
    { name: 'practice', track: 'git' },
    { name: 'cheatsheet', track: 'js' },
  ]
  for (const r of routes) expect(parseRoute(href(r))).toEqual(r)
})

test('unknown routes are not found', () => {
  expect(parseRoute('#/track/python').name).toBe('notFound')
  expect(parseRoute('#/nope').name).toBe('notFound')
  expect(parseRoute('').name).toBe('home')
})
