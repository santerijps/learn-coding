import { highlightLines, type CodeLanguage } from './highlight'

export function CodeBlock({ code, language }: { code: string; language: CodeLanguage }) {
  const lines = highlightLines(code.replace(/\n$/, ''), language)
  return (
    <pre className="code-block">
      <code>
        {lines.map((line, i) => (
          <span key={i} className="code-line">
            {line}
            {i < lines.length - 1 ? '\n' : null}
          </span>
        ))}
      </code>
    </pre>
  )
}
