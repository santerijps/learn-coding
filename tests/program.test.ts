import { describe, expect, test } from 'bun:test'
import { buildProgram, runProgram } from '../src/check/program'

const run = (setup: string, code: string, tests: string[]) => runProgram(buildProgram(setup, code, tests))

describe('test-card programs', () => {
  test('tests see variables declared by the answer', async () => {
    expect(await run('', 'const x = 2;', ['x === 2', 'x === 3'])).toEqual([true, false])
  })

  test('console output is captured, not printed', async () => {
    expect(await run('', 'console.log("Hei", 1); console.log({ a: 1 });', ['__logs[0] === "Hei 1"', '__logs[1] === "{\\"a\\":1}"', '__raw[0][1] === 1'])).toEqual([
      true,
      true,
      true,
    ])
  })

  test('a throwing test expression counts as failed', async () => {
    expect(await run('', '', ['missing.property === 1'])).toEqual([false])
  })

  test('a syntax error in the answer rejects', async () => {
    await expect(run('', 'const = 1', ['true'])).rejects.toThrow()
  })

  test('__isConst tells const from let', async () => {
    expect(await run('', 'const a = 1; let b = 1;', ['__isConst(() => { a = 2; })', '!__isConst(() => { b = 2; })'])).toEqual([true, true])
  })

  test('promise callbacks run before the tests', async () => {
    expect(await run('', 'Promise.resolve(5).then((v) => console.log(v));', ['__logs[0] === "5"'])).toEqual([true])
  })

  test('an answer starting with a bracket is not glued to the setup', async () => {
    expect(await run('let a = 1\nlet b = 2', '[a, b] = [b, a]', ['a === 2 && b === 1'])).toEqual([true])
  })
})
