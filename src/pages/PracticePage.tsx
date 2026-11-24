import { useState } from 'react'
import { course } from '../content'
import type { DeckCard, TrackId } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { buildRound, nextDue, unlockedCards } from '../session/buildRound'
import { weakestRound } from '../session/weak'
import { nextLesson } from '../session/nextLesson'
import { gradeAttempt, newCard, review } from '../srs/scheduler'
import { bumpStreak, loadAttempts, type Progress } from '../storage/progress'
import { formatDuration, formatRelative, m } from '../i18n'
import { CardDrill, type DrillResult } from '../practice/CardDrill'
import { NotFound } from './NotFound'

/** What a round draws its cards from. */
export type PracticeScope = { kind: 'track'; trackId: TrackId } | { kind: 'lesson'; lessonId: string } | { kind: 'weak'; trackId: TrackId }

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

const trackDeck = (trackId: TrackId) => course.deck.filter((c) => c.track === trackId)

/**
 * The cards for one round. Every scope fills up to ROUND_SIZE when it has enough cards:
 * - track: due and new cards from completed lessons first, then the soonest upcoming;
 * - lesson: that lesson's cards in the same order (works before the lesson is completed);
 * - weak: the learner's most-missed and least stable cards.
 */
function roundCards(scope: PracticeScope, progress: Progress): DeckCard[] {
  const now = new Date()
  switch (scope.kind) {
    case 'track':
      return buildRound(unlockedCards(trackDeck(scope.trackId), progress), progress, now, true)
    case 'lesson':
      return buildRound(
        course.deck.filter((c) => c.lessonId === scope.lessonId),
        progress,
        now,
        true,
      )
    case 'weak':
      return weakestRound(trackDeck(scope.trackId), progress, loadAttempts())
  }
}

function startRound(scope: PracticeScope, progress: Progress): Round {
  const queue = roundCards(scope, progress)
  return {
    queue,
    index: 0,
    requeued: new Set(),
    firstTry: new Map(),
    newIds: new Set(queue.filter((c) => !progress.cards[c.id]).map((c) => c.id)),
    startedAt: Date.now(),
  }
}

export function PracticePage({ scope }: { scope: PracticeScope }) {
  const { progress, update } = useProgress()
  const [round, setRound] = useState(() => startRound(scope, progress))
  // Each attempt gets its own key so a requeued card starts fresh.
  const [attempt, setAttempt] = useState(0)

  const lesson = scope.kind === 'lesson' ? course.tracks.flatMap((t) => t.lessons).find((l) => l.id === scope.lessonId) : undefined
  const trackId = scope.kind === 'lesson' ? course.deck.find((c) => c.lessonId === scope.lessonId)?.track : scope.trackId
  const track = trackId ? course.trackById.get(trackId) : undefined
  if (!track || (scope.kind === 'lesson' && !lesson)) return <NotFound />

  const title = scope.kind === 'lesson' ? `${m.practice}: ${lesson!.title}` : scope.kind === 'weak' ? m.weakRound : m.practice
  const back =
    scope.kind === 'lesson'
      ? { to: href({ name: 'lesson', lessonId: scope.lessonId }), label: lesson!.title }
      : { to: href({ name: 'track', track: track.id }), label: track.title }

  const restart = () => {
    setRound(startRound(scope, progress))
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
      <a href={back.to}>← {back.label}</a>
    </nav>
  )
  const firstOpenLesson = nextLesson(track.lessons, progress)

  // Nothing to practice: no completed lessons, or (weak round) nothing practiced yet.
  if (round.queue.length === 0) {
    return (
      <div className="page">
        {crumbs}
        <h1>{title}</h1>
        <p className="lead">{scope.kind === 'weak' ? m.weakNothingYet : m.noLessonsDone}</p>
        {firstOpenLesson ? (
          <a className="btn btn-primary" href={href({ name: 'lesson', lessonId: firstOpenLesson.id })}>
            {m.firstLesson(firstOpenLesson.title)}
          </a>
        ) : null}
      </div>
    )
  }

  // Round finished.
  if (round.finishedAt) {
    const results = [...round.firstTry.values()]
    const upcoming = nextDue(unlockedCards(trackDeck(track.id), progress), progress)
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
            {firstOpenLesson && scope.kind === 'track' ? (
              <a className="btn btn-ghost" href={href({ name: 'lesson', lessonId: firstOpenLesson.id })}>
                {m.continueWith(firstOpenLesson.title)}
              </a>
            ) : null}
            <a className="btn btn-ghost" href={href({ name: 'stats', track: track.id })}>
              {m.stats}
            </a>
            <a className="btn btn-ghost" href={href({ name: 'track', track: track.id })}>
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
      {scope.kind !== 'track' ? <p className="eyebrow">{title}</p> : null}
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
