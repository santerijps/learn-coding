import type { AnswerLanguage } from '../content/schema'

/**
 * Normalizes a JavaScript snippet so formatting choices don't count as mistakes:
 * whitespace, indentation, single vs double quotes, optional semicolons and line breaks
 * around brackets. Template literals (backticks) are kept as-is since they mean something different.
 */
export function normalizeJs(code: string): string {
  return (
    code
      .replace(/'/g, '"')
      .replace(/[ \t]+/g, ' ')
      // Statement separators: a semicolon and a line break are equivalent.
      .replace(/\s*[;\n]\s*/g, '\n')
      // Spaces next to punctuation never matter ("x = 1" vs "x=1").
      .replace(/ ?([^\p{L}\p{N}_$ \n]) ?/gu, '$1')
      // Line breaks next to brackets and commas don't matter either.
      .replace(/\n*([{}()[\],])\n*/g, '$1')
      .replace(/^\n+|\n+$/g, '')
  )
}

/** Normalizes a terminal command: surrounding and repeated whitespace, a pasted `$ ` prompt, and quote style. */
export function normalizeShell(command: string): string {
  return command
    .trim()
    .replace(/^\$\s+/, '')
    .replace(/'/g, '"')
    .replace(/\s+/g, ' ')
}

/** Python uses the same code normalization: its match cards are short one-liners like imports. */
export function normalize(answer: string, language: AnswerLanguage): string {
  return language === 'shell' ? normalizeShell(answer) : normalizeJs(answer)
}

export function matches(answer: string, expected: string[], language: AnswerLanguage): boolean {
  const a = normalize(answer, language)
  return a.length > 0 && expected.some((e) => normalize(e, language) === a)
}
