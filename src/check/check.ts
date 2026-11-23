import type { DeckCard } from '../content/schema'
import { matches } from './normalize'
import { buildProgram } from './program'
import { buildPythonProgram } from './pythonProgram'
import { runPython } from './python'

export type CheckResult = { correct: boolean; error?: string }
export type CheckMessages = { timeout: string; loadFailed: string }

const TIMEOUT_MS = 2000
/** Python runs a little slower in WebAssembly; give it more room before calling it an infinite loop. */
const PYTHON_TIMEOUT_MS = 4000

/**
 * The JavaScript worker is created from an inline script so it needs no separate bundle entry.
 * It receives a complete program (see buildProgram) and replies with the test results.
 */
const WORKER_SOURCE = `
const AsyncFunction = (async () => {}).constructor;
self.onmessage = async (e) => {
  try {
    const results = await new AsyncFunction(e.data)();
    self.postMessage({ ok: true, results });
  } catch (err) {
    self.postMessage({ ok: false, error: err && err.name ? err.name + ": " + err.message : String(err) });
  }
};
`

type WorkerReply = { ok: true; results: unknown } | { ok: false; error: string }

let workerUrl: string | undefined

/** Runs the learner's code in a fresh worker, so an infinite loop or a thrown error can't affect the app. */
function runJsInWorker(program: string, timeoutMessage: string): Promise<WorkerReply> {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
  return new Promise((resolve) => {
    const worker = new Worker(workerUrl!)
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ ok: false, error: timeoutMessage })
    }, TIMEOUT_MS)
    worker.onmessage = (e: MessageEvent<WorkerReply>) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(e.data)
    }
    worker.postMessage(program)
  })
}

async function runTests(card: Extract<DeckCard, { check: 'test' }>, answer: string, messages: CheckMessages): Promise<WorkerReply> {
  if (card.language !== 'python') return runJsInWorker(buildProgram(card.setup, answer, card.tests), messages.timeout)
  const res = await runPython(buildPythonProgram(card.setup, answer, card.tests, 'return'), PYTHON_TIMEOUT_MS, messages)
  if (!res.ok) return res
  try {
    return { ok: true, results: JSON.parse(res.value) }
  } catch {
    return { ok: false, error: res.value }
  }
}

export async function checkAnswer(card: DeckCard, answer: string, messages: CheckMessages): Promise<CheckResult> {
  if (!answer.trim()) return { correct: false }
  if (card.check === 'match') return { correct: matches(answer, [card.solution, ...card.accepted], card.language) }
  const reply = await runTests(card, answer, messages)
  if (!reply.ok) return { correct: false, error: reply.error }
  // A top-level `return` in the answer would skip the tests, so the result must have one entry per test.
  const { results } = reply
  return { correct: Array.isArray(results) && results.length === card.tests.length && results.every((r) => r === true) }
}
