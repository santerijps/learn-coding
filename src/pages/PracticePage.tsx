import { useState } from 'react'
import { course } from '../content'
import type { DeckCard, TrackId } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { buildRound, nextDue, unlockedCards } from '../session/buildRound'
import { gradeAttempt, newCard, review } from '../srs/scheduler'
import { bumpStreak, type Progress } from '../storage/progress'
import { formatDuration, formatRelative, m } from '../i18n'
import { CardDrill, type DrillResult } from '../practice/CardDrill'

type Round = {
  queue: DeckCard[]
  index: number
  /** Cards already sent to the back of the queue once this round. */
  requeued: Set<string>
  /** First-attempt result per card. */
  firstTry: Map<string, boolean>
  /** Cards that were new when the round started. */
  newIds: Set<string>
  startedAt: number
  finishedAt?: number
}

function trackCards(trackId: TrackId, progress: Progress) {
  return unlockedCards(
    course.deck.filter((c) => c.track === trackId),
    progress,
  )
}

/** Every round has ROUND_SIZE cards when enough are unlocked: due and new cards first, then the soonest upcoming. */
function startRound(trackId: TrackId, progress: Progress): Round {
  const queue = buildRound(trackCards(trackId, progress), progress, new Date(), true)
  return {
    queue,
    index: 0,
    requeued: new Set(),
    firstTry: new Map(),
    newIds: new Set(queue.filter((c) => !progress.cards[c.id]).map((c) => c.id)),
    startedAt: Date.now(),
  }
}

export function PracticePage({ trackId }: { trackId: TrackId }) {
  const { progress, update } = useProgress()
  const track = course.trackById.get(trackId)!
  const [round, setRound] = useState(() => startRound(trackId, progress))
  // Each attempt gets its own key so a requeued card starts fresh.
  const [attempt, setAttempt] = useState(0)

  const restart = () => {
    setRound(startRound(trackId, progress))
    setAttempt((a) => a + 1)
  }

  const onFinish = (card: DeckCard, r: DrillResult) => {
    update((p) => {
      const existing = p.cards[card.id]
      const grade = gradeAttempt({
        correct: r.correct,
        usedHint: r.usedHint,
        // An overridden answer counts as plain "Good", never "Easy".
        ms: r.override ? Infinity : r.ms,
        solutionLength: card.solution.length,
        seenBefore: !!existing && existing.reps > 0,
      })
      return { ...p, cards: { ...p.cards, [card.id]: review(existing ?? newCard(), grade) } }
    })

    const firstTry = new Map(round.firstTry)
    if (!firstTry.has(card.id)) firstTry.set(card.id, r.correct && !r.override)
    const requeued = new Set(round.requeued)
    const queue = [...round.queue]
    // A missed card comes back once at the end of the round.
    if (!r.correct && !requeued.has(card.id)) {
      requeued.add(card.id)
      queue.push(card)
    }
    const index = round.index + 1
    const done = index >= queue.length
    if (done) update((p) => ({ ...p, streak: bumpStreak(p.streak) }))
    setRound({ ...round, queue, index, requeued, firstTry, finishedAt: done ? Date.now() : undefined })
    setAttempt((a) => a + 1)
  }

  const crumbs = (
    <nav className="crumbs">
      <a href={href({ name: 'track', track: trackId })}>← {track.title}</a>
    </nav>
  )

  // No completed lessons yet, so nothing is unlocked.
  if (round.queue.length === 0) {
    const first = track.lessons.find((l) => !progress.lessons[l.id])
    return (
      <div className="page">
        {crumbs}
        <h1>{m.practice}</h1>
        <p className="lead">{m.noLessonsDone}</p>
        {first ? (
          <a className="btn btn-primary" href={href({ name: 'lesson', lessonId: first.id })}>
            {m.firstLesson(first.title)}
          </a>
        ) : null}
      </div>
    )
  }

  // Round finished.
  if (round.finishedAt) {
    const results = [...round.firstTry.values()]
    const upcoming = nextDue(trackCards(trackId, progress), progress)
    const first = track.lessons.find((l) => !progress.lessons[l.id])
    return (
      <div className="page">
        {crumbs}
        <section className="done-panel">
          <h1>{m.roundDone}</h1>
          <p className="big-stat">{m.firstTry(results.filter(Boolean).length, results.length)}</p>
          <p className="muted">
            {m.roundTime(formatDuration(round.finishedAt - round.startedAt))}
            {upcoming ? ` · ${m.nextReviewAt(formatRelative(upcoming))}` : ''}
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={restart} autoFocus>
              {m.newRound}
            </button>
            {first ? (
              <a className="btn btn-ghost" href={href({ name: 'lesson', lessonId: first.id })}>
                {m.continueWith(first.title)}
              </a>
            ) : null}
            <a className="btn btn-ghost" href={href({ name: 'track', track: trackId })}>
              {m.backToTrack}
            </a>
          </div>
        </section>
      </div>
    )
  }

  const card = round.queue[round.index]!
  return (
    <div className="page practice">
      {crumbs}
      <div className="round-head">
        <span>{m.cardCounter(round.index + 1, round.queue.length)}</span>
        <div className="meter" aria-hidden="true">
          <div style={{ width: `${(round.index / round.queue.length) * 100}%` }} />
        </div>
      </div>
      <CardDrill
        key={attempt}
        card={card}
        isNew={round.newIds.has(card.id) && !round.firstTry.has(card.id)}
        onFinish={(r) => onFinish(card, r)}
      />
    </div>
  )
}
