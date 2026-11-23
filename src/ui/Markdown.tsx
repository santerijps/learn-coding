import type { ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { codeLanguage, type CodeLanguage } from './highlight'

/**
 * A deliberately small markdown renderer for lesson content: `code`, **bold**, paragraphs,
 * `###` headings, `-` lists and fenced code blocks. Everything renders as React text, so content
 * can never inject HTML.
 */
export function Inline({ text }: { text: string }) {
  // ``double backticks`` allow code that itself contains a backtick, e.g. a template literal.
  const parts = text.split(/(``.+?``|`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('``') && part.endsWith('``') && part.length > 4) return <code key={i}>{part.slice(2, -2).trim()}</code>
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={i}>{part.slice(1, -1)}</code>
        if (part.startsWith('**') && part.endsWith('**') && part.length > 3) return <strong key={i}>{part.slice(2, -2)}</strong>
        return part
      })}
    </>
  )
}

export function Markdown({ source, codeFallback = 'plain' }: { source: string; codeFallback?: CodeLanguage }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    const fence = /^```(\S*)\s*$/.exec(line)
    if (fence) {
      const code: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i]!)) code.push(lines[i++]!)
      i++
      blocks.push(<CodeBlock key={blocks.length} code={code.join('\n')} language={codeLanguage(fence[1], codeFallback)} />)
    } else if (/^#{2,4} /.test(line)) {
      blocks.push(
        <h3 key={blocks.length}>
          <Inline text={line.replace(/^#+ /, '')} />
        </h3>,
      )
      i++
    } else if (/^- /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i]!)) {
        let item = lines[i++]!.slice(2)
        while (i < lines.length && /^ {2}\S/.test(lines[i]!)) item += ' ' + lines[i++]!.trim()
        items.push(item)
      }
      blocks.push(
        <ul key={blocks.length}>
          {items.map((it, j) => (
            <li key={j}>
              <Inline text={it} />
            </li>
          ))}
        </ul>,
      )
    } else if (line.trim() === '') {
      i++
    } else {
      const para: string[] = []
      while (i < lines.length && lines[i]!.trim() !== '' && !/^(```|#{2,4} |- )/.test(lines[i]!)) para.push(lines[i++]!.trim())
      blocks.push(
        <p key={blocks.length}>
          <Inline text={para.join(' ')} />
        </p>,
      )
    }
  }
  return <div className="prose">{blocks}</div>
}
