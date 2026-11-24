import { describe, expect, test } from 'bun:test'
import { matches, normalizeJs, normalizeShell, sameCode } from '../src/check/normalize'

describe('normalizeJs', () => {
  test('ignores spacing around punctuation', () => {
    expect(normalizeJs('const x=5')).toBe(normalizeJs('const x = 5'))
    expect(normalizeJs('import {a,b} from "m"')).toBe(normalizeJs('import { a, b } from "m"'))
  })

  test('treats single and double quotes alike', () => {
    expect(normalizeJs("import React from 'react'")).toBe(normalizeJs('import React from "react"'))
  })

  test('makes semicolons optional', () => {
    expect(normalizeJs('export const PI = 3.14;')).toBe(normalizeJs('export const PI = 3.14'))
    expect(normalizeJs('let a = 1; let b = 2;')).toBe(normalizeJs('let a = 1\nlet b = 2'))
  })

  test('ignores indentation and line breaks around brackets', () => {
    const multi = 'function f() {\n  return 1;\n}'
    expect(normalizeJs(multi)).toBe(normalizeJs('function f() { return 1; }'))
  })

  test('keeps meaningful differences', () => {
    expect(normalizeJs('const x = 5')).not.toBe(normalizeJs('let x = 5'))
    expect(normalizeJs('i++')).not.toBe(normalizeJs('i--'))
    expect(normalizeJs('"a b"')).not.toBe(normalizeJs('"ab"'))
    expect(normalizeJs('const tervehdys = "hyvää päivää"')).not.toBe(normalizeJs('const tervehdys = "hyvääpäivää"'))
  })

  test('keeps template literals distinct from strings', () => {
    expect(normalizeJs('`a`')).not.toBe(normalizeJs('"a"'))
  })
})

describe('normalizeShell', () => {
  test('ignores surrounding and repeated whitespace', () => {
    expect(normalizeShell('  git   status  ')).toBe('git status')
  })

  test('ignores a pasted prompt and quote style', () => {
    expect(normalizeShell("$ git commit -m 'Viesti'")).toBe('git commit -m "Viesti"')
  })

  test('keeps flags meaningful', () => {
    expect(normalizeShell('git diff --staged')).not.toBe(normalizeShell('git diff'))
  })
})

describe('matches', () => {
  test('accepts any listed variant', () => {
    expect(matches('git checkout -b korjaus', ['git switch -c korjaus', 'git checkout -b korjaus'], 'shell')).toBe(true)
  })

  test('rejects an empty answer', () => {
    expect(matches('   ', ['git status'], 'shell')).toBe(false)
    expect(matches('', [''], 'js')).toBe(false)
  })
})

describe('sameCode', () => {
  test('ignores formatting but not different code', () => {
    expect(sameCode('function f(x) { return x * x }', 'function f(x) {\n  return x * x;\n}\n', 'js')).toBe(true)
    expect(sameCode('const y = x ** 2', 'const y = x * x', 'js')).toBe(false)
    expect(sameCode("print('hi')", 'print("hi")\n', 'python')).toBe(true)
  })
})
