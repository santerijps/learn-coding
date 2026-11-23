/**
 * Builds the body of the async function that checks a `test` card. The browser runs it in a
 * Web Worker and the content tests run it in Bun, so a card whose solution passes the tests
 * behaves the same way in the app.
 *
 * The program resolves to one boolean per test expression. `console` is replaced so tests can
 * inspect output through `__logs` (formatted strings) and `__raw` (the original arguments).
 */
export function buildProgram(setup: string, code: string, tests: string[]): string {
  const checks = tests.map((t) => `await (async () => { try { return !!(${t}); } catch { return false; } })()`)
  return [
    '"use strict";',
    'const __logs = [];',
    'const __raw = [];',
    'const __fmt = (v) => (typeof v === "string" ? v : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v));',
    'const __log = (...args) => { __raw.push(args); __logs.push(args.map(__fmt).join(" ")); };',
    'const console = { log: __log, info: __log, warn: __log, error: __log };',
    'const __isConst = (assign) => { try { assign(); return false; } catch (e) { return e instanceof TypeError; } };',
    setup,
    // Guards against automatic semicolon insertion joining the setup and an answer that starts with ( or [.
    ';',
    code,
    ';',
    // Let pending promise callbacks and zero-delay timers run before checking.
    'await new Promise((resolve) => setTimeout(resolve, 0));',
    `return [${checks.join(', ')}];`,
  ].join('\n')
}

export const AsyncFunction = (async () => {}).constructor as new (body: string) => () => Promise<unknown>

/** Runs a program in the current realm. Used by the worker and by the content tests. */
export async function runProgram(program: string): Promise<boolean[]> {
  return (await new AsyncFunction(program)()) as boolean[]
}
