export type DiffPart = { text: string; changed: boolean }

/** Words/identifiers, single punctuation characters, and runs of whitespace. */
const TOKEN = /\s+|[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu

/** Tokens the checker doesn't care about are never highlighted: whitespace and semicolons. */
const ignored = (t: string) => /^\s+$/.test(t) || t === ';'
/** Quote style doesn't matter to the checker either. */
const key = (t: string) => t.replace(/'/g, '"')

/** Above this many tokens per side the comparison is skipped (everything counts as changed). */
const MAX_TOKENS = 600

/**
 * Token-level diff between the learner's answer and the model answer, based on the longest common
 * subsequence. Returns both sides split into parts; `changed` marks text that differs: in the
 * answer it is extra or wrong, in the model answer it is what was missing.
 */
export function diffAnswer(answer: string, model: string): { answer: DiffPart[]; model: DiffPart[] } {
  const ta = answer.match(TOKEN) ?? []
  const tb = model.match(TOKEN) ?? []
  const ia = ta.flatMap((t, i) => (ignored(t) ? [] : [i]))
  const ib = tb.flatMap((t, i) => (ignored(t) ? [] : [i]))
  const matchedA = new Set<number>()
  const matchedB = new Set<number>()

  if (ia.length <= MAX_TOKENS && ib.length <= MAX_TOKENS) {
    const n = ia.length
    const m = ib.length
    // lcs[i][j] = length of the LCS of ia[i..] and ib[j..]
    const lcs = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i]![j] = key(ta[ia[i]!]!) === key(tb[ib[j]!]!) ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!)
      }
    }
    let i = 0
    let j = 0
    while (i < n && j < m) {
      if (key(ta[ia[i]!]!) === key(tb[ib[j]!]!)) {
        matchedA.add(ia[i]!)
        matchedB.add(ib[j]!)
        i++
        j++
      } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) i++
      else j++
    }
  }

  const parts = (tokens: string[], matched: Set<number>): DiffPart[] => {
    const out: DiffPart[] = []
    tokens.forEach((text, i) => {
      const changed = !ignored(text) && !matched.has(i)
      const last = out[out.length - 1]
      // Merge neighbours with the same state; whitespace joins a changed run only if the run continues.
      if (last && last.changed === changed) last.text += text
      else out.push({ text, changed })
    })
    return out
  }

  return { answer: parts(ta, matchedA), model: parts(tb, matchedB) }
}
