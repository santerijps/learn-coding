import type { ReactNode } from 'react'
import { classHighlighter, highlightCode } from '@lezer/highlight'
import { parser as jsParser } from '@lezer/javascript'

export type CodeLanguage = 'js' | 'shell' | 'plain'

export function codeLanguage(fenceInfo: string | undefined, fallback: CodeLanguage = 'plain'): CodeLanguage {
  const lang = (fenceInfo ?? '').trim().toLowerCase()
  if (['js', 'javascript', 'ts', 'typescript', 'jsx'].includes(lang)) return 'js'
  if (['bash', 'sh', 'shell', 'console', 'git', 'gitignore'].includes(lang)) return 'shell'
  return lang ? 'plain' : fallback
}

/**
 * Splits code into lines of highlighted spans. JavaScript uses the Lezer parser with the same
 * `tok-*` classes as the editor. Shell gets a light touch: comments and the leading command.
 */
export function highlightLines(code: string, language: CodeLanguage): ReactNode[][] {
  if (language === 'js') {
    const lines: ReactNode[][] = [[]]
    let key = 0
    highlightCode(
      code,
      jsParser.parse(code),
      classHighlighter,
      (text, classes) => {
        lines[lines.length - 1]!.push(
          classes ? (
            <span key={key++} className={classes}>
              {text}
            </span>
          ) : (
            text
          ),
        )
      },
      () => lines.push([]),
    )
    return lines
  }
  return code.split('\n').map((line, i) => {
    if (language !== 'shell') return [line]
    if (/^\s*#/.test(line)) return [<span key={i} className="tok-comment">{line}</span>]
    const m = /^(\s*)(git|cd|mkdir|echo|cat|ls|rm|touch)(\b.*)$/.exec(line)
    return m ? [m[1], <span key={i} className="tok-keyword">{m[2]}</span>, m[3]] : [line]
  })
}
