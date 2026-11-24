import type { ReactNode } from 'react'
import { classHighlighter, highlightCode } from '@lezer/highlight'
import type { Parser } from '@lezer/common'
import { parser as jsParser } from '@lezer/javascript'
import { parser as pythonParser } from '@lezer/python'

export type CodeLanguage = 'js' | 'python' | 'shell' | 'plain'

export function codeLanguage(fenceInfo: string | undefined, fallback: CodeLanguage = 'plain'): CodeLanguage {
  const lang = (fenceInfo ?? '').trim().toLowerCase()
  if (['js', 'javascript', 'ts', 'typescript', 'jsx'].includes(lang)) return 'js'
  if (['py', 'python'].includes(lang)) return 'python'
  if (['bash', 'sh', 'shell', 'console', 'git', 'gitignore', 'powershell', 'ps', 'cmd'].includes(lang)) return 'shell'
  return lang ? 'plain' : fallback
}

const PARSERS: Partial<Record<CodeLanguage, Parser>> = { js: jsParser, python: pythonParser }

/**
 * Splits code into lines of highlighted spans. JavaScript and Python use Lezer parsers with the
 * same `tok-*` classes as the editor. Shell gets a light touch: comments and the leading command.
 */
export function highlightLines(code: string, language: CodeLanguage): ReactNode[][] {
  const parser = PARSERS[language]
  if (parser) {
    const lines: ReactNode[][] = [[]]
    let key = 0
    highlightCode(
      code,
      parser.parse(code),
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
