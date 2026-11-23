import { buildProgram, runProgram } from '../src/check/program'
import { buildPythonProgram } from '../src/check/pythonProgram'

export type RunResult = { ok: true; results: boolean[] } | { ok: false; error: string }

/** Runs a JavaScript test card program in this Bun process (the browser runs the same program in a worker). */
export async function runJs(setup: string, code: string, tests: string[]): Promise<RunResult> {
  try {
    return { ok: true, results: await runProgram(buildProgram(setup, code, tests)) }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

/**
 * Runs many Python test card programs in a single `python3` process (the browser runs the same
 * programs with Pyodide). Each program prints its results as JSON on its last line.
 */
const DRIVER = `
import contextlib, io, json, sys
out = []
for program in json.load(sys.stdin):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(program, {"__name__": "__main__"})
        out.append({"ok": True, "results": json.loads(buf.getvalue().strip().splitlines()[-1])})
    except BaseException as e:
        out.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
sys.stdout.write(json.dumps(out))
`

export function runPythonBatch(items: { setup: string; code: string; tests: string[] }[]): RunResult[] {
  if (items.length === 0) return []
  const programs = items.map((i) => buildPythonProgram(i.setup, i.code, i.tests, 'print'))
  const proc = Bun.spawnSync(['python3', '-c', DRIVER], { stdin: Buffer.from(JSON.stringify(programs)) })
  if (proc.exitCode !== 0) throw new Error(`python3 failed: ${proc.stderr.toString()}`)
  return JSON.parse(proc.stdout.toString()) as RunResult[]
}
