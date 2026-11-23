import { useEffect, useRef, useState } from 'react'
import { course } from '../content'
import type { DeckCard, TrackId } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { unlockedCards } from '../session/buildRound'
import { checkAnswer } from '../check/check'
import { logAttempt } from '../storage/progress'
import { m } from '../i18n'
import { Editor } from '../ui/Editor'
import { CodeBlock } from '../ui/CodeBlock'
import { AnswerDiff } from '../ui/AnswerDiff'
import { Inline } from '../ui/Markdown'

export const CHALLENGE_SECONDS = 60

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

type Phase = 'intro' | 'running' | 'done'

/**
 * Timed challenge: as many correct answers as possible in CHALLENGE_SECONDS, from completed
 * lessons in random order. Results are logged for the stats but don't change review scheduling,
 * since answers typed against the clock are a noisy signal.
 */
export function ChallengePage({ trackId }: { trackId: TrackId }) {
  const { progress, update } = useProgress()
  const track = course.trackById.get(trackId)!
  const pool = unlockedCards(
    course.deck.filter((c) => c.track === trackId),
    progress,
  )

  const [phase, setPhase] = useState<Phase>('intro')
  const [queue, setQueue] = useState<DeckCard[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState<DeckCard[]>([])
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState<{ score: number; previousBest?: number } | null>(null)
  // Per-card state
  const [answer, setAnswer] = useState('')
  const [checking, setChecking] = useState(false)
  const [wrong, setWrong] = useState(false)
  const shownAt = useRef(0)
  const scoreRef = useRef(0)

  const card = queue[index % Math.max(queue.length, 1)]
  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))

  const start = () => {
    setQueue(shuffle(pool))
    setIndex(0)
    setScore(0)
    scoreRef.current = 0
    setMissed([])
    setAnswer('')
    setWrong(false)
    setResult(null)
    setDeadline(Date.now() + CHALLENGE_SECONDS * 1000)
    setNow(Date.now())
    shownAt.current = performance.now()
    setPhase('running')
  }

  // Clock: tick while running and finish when time is up.
  useEffect(() => {
    if (phase !== 'running') return
    const timer = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= deadline) {
        clearInterval(timer)
        const final = scoreRef.current
        const previousBest = progress.challengeBest[trackId]
        setResult({ score: final, previousBest })
        if (previousBest === undefined || final > previousBest) {
          update((p) => ({ ...p, challengeBest: { ...p.challengeBest, [trackId]: final } }))
        }
        setPhase('done')
      }
    }, 200)
    return () => clearInterval(timer)
  }, [phase, deadline])

  const next = () => {
    // Reshuffle when the pool runs out so the challenge never stalls.
    if ((index + 1) % queue.length === 0) setQueue(shuffle(pool))
    setIndex((i) => i + 1)
    setAnswer('')
    setWrong(false)
    shownAt.current = performance.now()
  }

  const submit = async (skip = false) => {
    if (!card || checking || wrong || phase !== 'running') return
    if (!skip && !answer.trim()) return
    setChecking(true)
    const res = skip ? { correct: false } : await checkAnswer(card, answer, m.timeout)
    setChecking(false)
    if (Date.now() >= deadline) return
    logAttempt({
      cardId: card.id,
      answer,
      correct: res.correct,
      ms: Math.round(performance.now() - shownAt.current),
      usedHint: false,
      override: false,
      mode: 'challenge',
      at: new Date().toISOString(),
    })
    if (res.correct) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      next()
    } else {
      setMissed((ms) => (ms.some((c) => c.id === card.id) ? ms : [...ms, card]))
      setWrong(true)
    }
  }

  const crumbs = (
    <nav className="crumbs">
      <a href={href({ name: 'track', track: trackId })}>← {track.title}</a>
    </nav>
  )

  if (pool.length === 0) {
    const first = track.lessons[0]!
    return (
      <div className="page">
        {crumbs}
        <h1>{m.challenge}</h1>
        <p className="lead">{m.noLessonsDone}</p>
        <a className="btn btn-primary" href={href({ name: 'lesson', lessonId: first.id })}>
          {m.firstLesson(first.title)}
        </a>
      </div>
    )
  }

  if (phase === 'intro') {
    const best = progress.challengeBest[trackId]
    return (
      <div className="page">
        {crumbs}
        <h1>
          {m.challenge}: {track.title}
        </h1>
        <p className="lead">{m.challengeIntro(CHALLENGE_SECONDS)}</p>
        {best !== undefined ? <p className="big-stat">{m.challengeBestWas(best)}</p> : null}
        <div className="actions">
          <button className="btn btn-primary" onClick={start} autoFocus>
            {m.challengeStart}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done' && result) {
    const isBest = result.previousBest === undefined ? result.score > 0 : result.score > result.previousBest
    return (
      <div className="page">
        {crumbs}
        <section className="done-panel">
          <h1>{m.challengeScore(result.score)}</h1>
          {isBest ? (
            <p className="big-stat">🏆 {m.challengeNewBest}</p>
          ) : result.previousBest !== undefined ? (
            <p className="muted">{m.challengeBestWas(result.previousBest)}</p>
          ) : null}
          <div className="actions">
            <button className="btn btn-primary" onClick={start} autoFocus>
              {m.challengeAgain}
            </button>
            <a className="btn btn-ghost" href={href({ name: 'stats', track: trackId })}>
              {m.stats}
            </a>
            <a className="btn btn-ghost" href={href({ name: 'track', track: trackId })}>
              {m.backToTrack}
            </a>
          </div>
        </section>
        {missed.length ? (
          <section>
            <h2>{m.challengeMissed}</h2>
            <dl className="sheet">
              {missed.map((c) => (
                <div key={c.id} className="sheet-item">
                  <dt>
                    <Inline text={c.prompt} />
                  </dt>
                  <dd>
                    <CodeBlock code={c.solution} language={c.language} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    )
  }

  if (!card) return null
  const submitHint = card.language === 'js' ? m.submitHintJs(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl') : m.submitHintShell
  return (
    <div className="page practice">
      {crumbs}
      <div className="challenge-head">
        <span className={`clock ${secondsLeft <= 10 ? 'clock-low' : ''}`} role="timer" aria-live="off">
          ⏱ {m.challengeTimeLeft(secondsLeft)}
        </span>
        <span className="score">{m.challengeScore(score)}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <div style={{ width: `${(secondsLeft / CHALLENGE_SECONDS) * 100}%` }} />
      </div>
      <div className="drill">
        <p className="eyebrow">{card.lessonTitle}</p>
        <h2 className="drill-prompt">
          <Inline text={card.prompt} />
        </h2>
        {card.check === 'test' && card.setup.trim() ? (
          <div className="given">
            <p className="label">{m.givenCode}</p>
            <CodeBlock code={card.setup} language={card.language} />
          </div>
        ) : null}
        {wrong ? (
          <div className="feedback feedback-wrong" role="status">
            <p className="feedback-title">{m.challengeWrong}</p>
            {answer.trim() ? (
              <AnswerDiff answer={answer} model={card.solution} />
            ) : (
              <>
                <p className="label">{m.modelAnswer}</p>
                <CodeBlock code={card.solution} language={card.language} />
              </>
            )}
            <button className="btn btn-primary" onClick={next} autoFocus>
              {m.continue}
            </button>
          </div>
        ) : (
          <>
            <Editor
              key={index}
              language={card.language}
              onChange={setAnswer}
              onSubmit={() => void submit()}
              placeholder={card.language === 'js' ? m.answerPlaceholderJs : m.answerPlaceholderShell}
              ariaLabel={m.answerLabel}
            />
            <p className="muted small">{submitHint}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => void submit()} disabled={checking || !answer.trim()}>
                {checking ? m.checking : m.check}
              </button>
              <button className="btn btn-ghost" onClick={() => void submit(true)} disabled={checking}>
                {m.challengeSkip}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
