/**
 * Builds the Python program that checks a Python `test` card. The browser runs it with Pyodide
 * (result returned as the value of the last expression) and the content tests run it with
 * `python3` (result printed as the last line), so both see the same behaviour.
 *
 * The answer runs after `setup` in a fresh namespace with stdout captured. Tests are Python
 * expressions evaluated in that namespace; they can read `__logs` (printed lines as strings).
 * Tests can also call `__raises(f, ErrorType, message)`.
 * Strings are embedded as JSON literals, which are valid Python string literals.
 */
export function buildPythonProgram(setup: string, code: string, tests: string[], output: 'return' | 'print'): string {
  const j = JSON.stringify
  return [
    'import io as __io, json as __json, contextlib as __ctx',
    // Test helper: does calling f raise `kind` (with this exact message, if given)?
    'def __raises(f, kind, message=None):',
    '    try:',
    '        f()',
    '    except kind as e:',
    '        return message is None or str(e) == message',
    '    except Exception:',
    '        return False',
    '    return False',
    '__ns = {"__name__": "__main__", "__raises": __raises}',
    '__buf = __io.StringIO()',
    `__src = ${j(setup)} + "\\n" + ${j(code)}`,
    'with __ctx.redirect_stdout(__buf):',
    '    exec(compile(__src, "<answer>", "exec"), __ns)',
    '__ns["__logs"] = __buf.getvalue().splitlines()',
    `__tests = ${j(tests)}`,
    '__results = []',
    'with __ctx.redirect_stdout(__io.StringIO()):',
    '    for __t in __tests:',
    '        try:',
    '            __results.append(bool(eval(__t, __ns)))',
    '        except Exception:',
    '            __results.append(False)',
    output === 'return' ? '__json.dumps(__results)' : 'print(__json.dumps(__results))',
  ].join('\n')
}

/** The last line of a Python traceback, e.g. "NameError: name 'x' is not defined". */
export function pythonErrorLine(message: string): string {
  const lines = message.trim().split('\n').filter((l) => l.trim())
  return lines[lines.length - 1]?.trim() ?? message
}
