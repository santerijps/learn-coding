import { Fragment, useState } from 'react'
import type { AnswerLanguage, Exercise } from '../content/schema'
import { matches } from '../check/normalize'
import { m } from '../i18n'
import { Inline } from '../ui/Markdown'
import type { CodeLanguage } from '../ui/highlight'
import { Feedback } from './Feedback'
import { useAttempts } from './useAttempts'

type Props = {
  exercise: Extract<Exercise, { type: 'blank' }>
  language: AnswerLanguage
  codeLanguage: CodeLanguage
  onNext: () => void
}

export function BlankExercise({ exercise, language, codeLanguage, onNext }: Props) {
  const { status, wrong, answer, done } = useAttempts()
  const parts = exercise.code.split('___')
  const [values, setValues] = useState<string[]>(() => exercise.blanks.map(() => ''))
  const [checked, setChecked] = useState<boolean[] | null>(null)

  const isRight = (i: number, v: string) => matches(v, exercise.blanks[i]!, language)

  const check = () => {
    if (done) return
    const results = values.map((v, i) => isRight(i, v))
    setChecked(results)
    answer(results.every(Boolean))
  }

  const shown = status === 'revealed' ? exercise.blanks.map((b) => b[0]!) : values

  return (
    <div className="exercise">
      <p className="exercise-question">
        <Inline text={exercise.question} />
      </p>
      <p className="muted">{m.blankInstruction}</p>
      <pre className="code-block blank-code">
        <code>
          {parts.map((part, i) => (
            <Fragment key={i}>
              {part}
              {i < parts.length - 1 ? (
                <input
                  className={`blank ${checked && !done ? (checked[i] ? 'right' : 'wrong') : ''} ${done ? 'right' : ''}`}
                  value={shown[i] ?? ''}
                  size={Math.max(3, ...exercise.blanks[i]!.map((a) => a.length))}
                  aria-label={m.blankLabel(i + 1)}
                  autoFocus={i === 0}
                  readOnly={done}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  onChange={(e) => setValues((vs) => vs.map((v, j) => (j === i ? e.target.value : v)))}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    // Without this, the same keypress also activates the "next" button that receives focus.
                    e.preventDefault()
                    check()
                  }}
                />
              ) : null}
            </Fragment>
          ))}
        </code>
      </pre>
      {!done ? (
        <button className="btn btn-primary" onClick={check} disabled={values.some((v) => !v.trim())}>
          {m.check}
        </button>
      ) : null}
      <Feedback status={status} wrong={wrong} explanation={exercise.explanation} codeLanguage={codeLanguage} onNext={onNext} />
    </div>
  )
}
