import { m } from '../i18n'
import { Markdown } from '../ui/Markdown'
import type { CodeLanguage } from '../ui/highlight'
import type { ExerciseStatus } from './useAttempts'

type Props = {
  status: ExerciseStatus
  wrong: number
  explanation: string
  codeLanguage: CodeLanguage
  onNext: () => void
}

/** Feedback under an exercise: retry prompt while answering, explanation and "next" once resolved. */
export function Feedback({ status, wrong, explanation, codeLanguage, onNext }: Props) {
  if (status === 'answering') {
    return wrong > 0 ? (
      <p className="feedback feedback-wrong" role="status">
        {m.tryAgain}
      </p>
    ) : null
  }
  return (
    <div className={`feedback ${status === 'solved' ? 'feedback-right' : 'feedback-revealed'}`} role="status">
      <p className="feedback-title">{status === 'solved' ? m.correct : m.revealed}</p>
      <Markdown source={explanation} codeFallback={codeLanguage} />
      <button className="btn btn-primary" onClick={onNext} autoFocus>
        {m.next}
      </button>
    </div>
  )
}
