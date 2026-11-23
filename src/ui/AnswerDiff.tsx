import { m } from '../i18n'
import { diffAnswer, type DiffPart } from './diff'

function Side({ parts, kind }: { parts: DiffPart[]; kind: 'del' | 'ins' }) {
  return (
    <pre className="code-block diff">
      <code>
        {parts.map((p, i) =>
          p.changed ? (
            <mark key={i} className={`diff-${kind}`}>
              {p.text}
            </mark>
          ) : (
            p.text
          ),
        )}
      </code>
    </pre>
  )
}

/**
 * The learner's answer next to the model answer, with differences highlighted:
 * red marks what was wrong or extra in the answer, green what the answer was missing.
 */
export function AnswerDiff({ answer, model }: { answer: string; model: string }) {
  const diff = diffAnswer(answer.replace(/\n$/, ''), model.replace(/\n$/, ''))
  return (
    <div className="answer-diff">
      <p className="label">{m.answerLabel}</p>
      <Side parts={diff.answer} kind="del" />
      <p className="label">{m.modelAnswer}</p>
      <Side parts={diff.model} kind="ins" />
      <p className="muted small">{m.diffLegend}</p>
    </div>
  )
}
