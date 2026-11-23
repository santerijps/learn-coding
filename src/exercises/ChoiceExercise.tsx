import { useState } from 'react'
import type { Exercise } from '../content/schema'
import { CodeBlock } from '../ui/CodeBlock'
import { Inline } from '../ui/Markdown'
import type { CodeLanguage } from '../ui/highlight'
import { Feedback } from './Feedback'
import { useAttempts } from './useAttempts'

type Props = { exercise: Extract<Exercise, { type: 'choice' }>; codeLanguage: CodeLanguage; onNext: () => void }

export function ChoiceExercise({ exercise, codeLanguage, onNext }: Props) {
  const { status, wrong, answer, done } = useAttempts()
  const [picked, setPicked] = useState<number[]>([])

  const pick = (i: number) => {
    setPicked((p) => [...p, i])
    answer(i === exercise.answer)
  }

  return (
    <div className="exercise">
      <p className="exercise-question">
        <Inline text={exercise.question} />
      </p>
      {exercise.code ? <CodeBlock code={exercise.code} language={codeLanguage} /> : null}
      <div className="choices">
        {exercise.options.map((option, i) => {
          const isAnswer = i === exercise.answer
          const state = done && isAnswer ? 'right' : picked.includes(i) && !isAnswer ? 'wrong' : ''
          return (
            <button
              key={i}
              className={`choice ${state}`}
              disabled={done || picked.includes(i)}
              onClick={() => pick(i)}
            >
              <Inline text={option} />
            </button>
          )
        })}
      </div>
      <Feedback status={status} wrong={wrong} explanation={exercise.explanation} codeLanguage={codeLanguage} onNext={onNext} />
    </div>
  )
}
