import { useRef, useState } from 'react'
import type { DeckCard } from '../content/schema'
import { checkAnswer } from '../check/check'
import { logAttempt } from '../storage/progress'
import { m } from '../i18n'
import { Editor } from '../ui/Editor'
import { CodeBlock } from '../ui/CodeBlock'
import { Inline } from '../ui/Markdown'

export type DrillResult = {
  correct: boolean
  usedHint: boolean
  ms: number
  /** The learner said the checker was wrong. Graded as an ordinary correct answer. */
  override: boolean
}

type Phase = 'answer' | 'checking' | 'correct' | 'retype' | 'retyped'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/**
 * One rapid-fire card: type the answer from memory. On a miss the model answer is shown and must be
 * typed out once before moving on, since writing it is what builds recall.
 */
export function CardDrill({ card, isNew, onFinish }: { card: DeckCard; isNew: boolean; onFinish: (r: DrillResult) => void }) {
  const [phase, setPhase] = useState<Phase>('answer')
  const [answer, setAnswer] = useState('')
  const [retype, setRetype] = useState('')
  const [retypeWrong, setRetypeWrong] = useState(false)
  const [busy, setBusy] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const startedAt = useRef(performance.now())
  const answerMs = useRef(0)

  const record = (correct: boolean, override = false, err?: string) =>
    logAttempt({
      cardId: card.id,
      answer,
      correct,
      ms: Math.round(answerMs.current),
      usedHint,
      override,
      error: err,
      at: new Date().toISOString(),
    })

  const submitAnswer = async () => {
    if (phase !== 'answer' || !answer.trim()) return
    answerMs.current = performance.now() - startedAt.current
    setPhase('checking')
    const res = await checkAnswer(card, answer, m.timeout)
    record(res.correct, false, res.error)
    setError(res.error)
    setPhase(res.correct ? 'correct' : 'retype')
  }

  const giveUp = () => {
    answerMs.current = performance.now() - startedAt.current
    record(false)
    setPhase('retype')
  }

  const submitRetype = async () => {
    if (phase !== 'retype' || !retype.trim() || busy) return
    setBusy(true)
    const res = await checkAnswer(card, retype, m.timeout)
    setBusy(false)
    if (res.correct) setPhase('retyped')
    else setRetypeWrong(true)
  }

  const finish = (override = false) => {
    if (override) record(true, true)
    onFinish({ correct: phase === 'correct' || override, usedHint, ms: answerMs.current, override })
  }

  const submitHint = card.language === 'js' ? m.submitHintJs(isMac ? '⌘' : 'Ctrl') : m.submitHintShell

  return (
    <div className="drill">
      <p className="eyebrow">
        {card.lessonTitle}
        {isNew ? <span className="badge badge-new">{m.newCard}</span> : null}
      </p>
      <h2 className="drill-prompt">
        <Inline text={card.prompt} />
      </h2>
      {card.check === 'test' && card.setup.trim() ? (
        <div className="given">
          <p className="label">{m.givenCode}</p>
          <CodeBlock code={card.setup} language={card.language} />
        </div>
      ) : null}

      {phase === 'answer' || phase === 'checking' ? (
        <>
          <Editor
            key="answer"
            language={card.language}
            onChange={setAnswer}
            onSubmit={submitAnswer}
            placeholder={card.language === 'js' ? m.answerPlaceholderJs : m.answerPlaceholderShell}
            ariaLabel={m.answerLabel}
          />
          <p className="muted small">{submitHint}</p>
          {usedHint && card.hint ? (
            <p className="hint">
              💡 <Inline text={card.hint} />
            </p>
          ) : null}
          <div className="actions">
            <button className="btn btn-primary" onClick={submitAnswer} disabled={phase === 'checking' || !answer.trim()}>
              {phase === 'checking' ? m.checking : m.check}
            </button>
            {card.hint && !usedHint ? (
              <button className="btn btn-ghost" onClick={() => setUsedHint(true)}>
                {m.hint}
              </button>
            ) : null}
            <button className="btn btn-ghost" onClick={giveUp} disabled={phase === 'checking'}>
              {m.giveUp}
            </button>
          </div>
        </>
      ) : null}

      {phase === 'correct' ? (
        <div className="feedback feedback-right" role="status">
          <p className="feedback-title">{m.correct}</p>
          <p className="label">{m.modelAnswer}</p>
          <CodeBlock code={card.solution} language={card.language} />
          <button className="btn btn-primary" onClick={() => finish()} autoFocus>
            {m.continue}
          </button>
        </div>
      ) : null}

      {phase === 'retype' ? (
        <div className="feedback feedback-wrong" role="status">
          <p className="feedback-title">{m.wrongRetype}</p>
          {error ? (
            <p className="error">
              {m.errorPrefix}: <code>{error}</code>
            </p>
          ) : null}
          {answer.trim() ? (
            <>
              <p className="label">{m.answerLabel}</p>
              <CodeBlock code={answer} language={card.language} />
            </>
          ) : null}
          <p className="label">{m.modelAnswer}</p>
          <CodeBlock code={card.solution} language={card.language} />
          <Editor
            key="retype"
            language={card.language}
            onChange={(v) => {
              setRetype(v)
              setRetypeWrong(false)
            }}
            onSubmit={submitRetype}
            placeholder={m.retypePlaceholder}
            ariaLabel={m.retypePlaceholder}
          />
          <p className="muted small">{submitHint}</p>
          {retypeWrong ? <p className="error">{m.retypeWrong}</p> : null}
          <div className="actions">
            <button className="btn btn-primary" onClick={submitRetype} disabled={!retype.trim() || busy}>
              {busy ? m.checking : m.check}
            </button>
            {answer.trim() ? (
              <button className="btn btn-link" onClick={() => finish(true)}>
                {m.overrideRight}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === 'retyped' ? (
        <div className="feedback feedback-revealed" role="status">
          <p className="feedback-title">{m.retypeDone}</p>
          <button className="btn btn-primary" onClick={() => finish()} autoFocus>
            {m.continue}
          </button>
        </div>
      ) : null}
    </div>
  )
}
