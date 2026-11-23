import { useState } from 'react'
import type { Exercise } from '../content/schema'
import { m } from '../i18n'
import { highlightLines, type CodeLanguage } from '../ui/highlight'
import { Inline } from '../ui/Markdown'
import { Feedback } from './Feedback'
import { useAttempts } from './useAttempts'

type Props = { exercise: Extract<Exercise, { type: 'bug' }>; codeLanguage: CodeLanguage; onNext: () => void }

export function BugExercise({ exercise, codeLanguage, onNext }: Props) {
  const { status, wrong, answer, done } = useAttempts()
  const [picked, setPicked] = useState<number[]>([])
  const lines = highlightLines(exercise.code.replace(/\n$/, ''), codeLanguage)

  const pick = (line: number) => {
    setPicked((p) => [...p, line])
    answer(line === exercise.bugLine)
  }

  return (
    <div className="exercise">
      <p className="exercise-question">
        <Inline text={exercise.question} />
      </p>
      <p className="muted">{m.bugInstruction}</p>
      <div className="code-block bug-lines" role="group">
        {lines.map((content, i) => {
          const n = i + 1
          const isBug = n === exercise.bugLine
          const state = done && isBug ? 'right' : picked.includes(n) && !isBug ? 'wrong' : ''
          return (
            <button key={n} className={`bug-line ${state}`} disabled={done || picked.includes(n)} onClick={() => pick(n)}>
              <span className="line-no" aria-hidden="true">
                {n}
              </span>
              <code>{content.length ? content : ' '}</code>
            </button>
          )
        })}
      </div>
      <Feedback status={status} wrong={wrong} explanation={exercise.explanation} codeLanguage={codeLanguage} onNext={onNext} />
    </div>
  )
}
