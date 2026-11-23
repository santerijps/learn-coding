import { pythonErrorLine } from './pythonProgram'

/**
 * Runs Python in a Web Worker with Pyodide (CPython compiled to WebAssembly). The runtime (~14 MB)
 * is served from this site under `pyodide/` and loaded only when Python is first needed; the
 * browser caches it after that. A run that exceeds its time limit terminates the worker, and the
 * next run starts a fresh one.
 */

const WORKER_SOURCE = `
let pyodide = null;
self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (!pyodide) {
      importScripts(msg.base + "pyodide.js");
      pyodide = await loadPyodide({ indexURL: msg.base });
    }
    if (msg.type === "load") {
      self.postMessage({ id: msg.id, ok: true, value: null });
      return;
    }
    const value = pyodide.runPython(msg.program);
    self.postMessage({ id: msg.id, ok: true, value: String(value) });
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
`

type Reply = { id: number; ok: true; value: string | null } | { id: number; ok: false; error: string }
export type PythonResult = { ok: true; value: string } | { ok: false; error: string }

const LOAD_TIMEOUT_MS = 90_000

let workerUrl: string | undefined
let worker: Worker | null = null
let loaded: Promise<void> | null = null
let ready = false
let seq = 0
const pending = new Map<number, (r: Reply) => void>()

function base(): string {
  return new URL('pyodide/', document.baseURI).href
}

function send(message: { type: 'load' } | { type: 'run'; program: string }): Promise<Reply> {
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, resolve)
    worker!.postMessage({ ...message, id, base: base() })
  })
}

function reset() {
  worker?.terminate()
  worker = null
  loaded = null
  ready = false
  for (const resolve of pending.values()) resolve({ id: 0, ok: false, error: 'stopped' })
  pending.clear()
}

/** Starts loading the Python runtime in the background. Safe to call many times. */
export function preloadPython(): Promise<void> {
  if (loaded) return loaded
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
  worker = new Worker(workerUrl)
  worker.onmessage = (e: MessageEvent<Reply>) => {
    pending.get(e.data.id)?.(e.data)
    pending.delete(e.data.id)
  }
  loaded = Promise.race([
    send({ type: 'load' }),
    new Promise<Reply>((resolve) => setTimeout(() => resolve({ id: 0, ok: false, error: 'timeout' }), LOAD_TIMEOUT_MS)),
  ]).then((r) => {
    if (!r.ok) {
      reset()
      throw new Error(r.error)
    }
    ready = true
  })
  return loaded
}

export function isPythonReady(): boolean {
  return ready
}

export async function runPython(program: string, timeoutMs: number, messages: { timeout: string; loadFailed: string }): Promise<PythonResult> {
  try {
    await preloadPython()
  } catch {
    return { ok: false, error: messages.loadFailed }
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<PythonResult>((resolve) => {
    timer = setTimeout(() => {
      reset()
      resolve({ ok: false, error: messages.timeout })
    }, timeoutMs)
  })
  const run = send({ type: 'run', program }).then((r): PythonResult => {
    clearTimeout(timer)
    return r.ok ? { ok: true, value: r.value ?? '' } : { ok: false, error: pythonErrorLine(r.error) }
  })
  return Promise.race([run, timedOut])
}
