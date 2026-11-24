import { course } from '../content'
import type { TrackId } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { dueCards, newCards, unlockedCards } from '../session/buildRound'
import { m } from '../i18n'

export function TrackPage({ trackId }: { trackId: TrackId }) {
  const { progress } = useProgress()
  const track = course.trackById.get(trackId)!
  const unlocked = unlockedCards(course.deck.filter((c) => c.track === trackId), progress)
  const due = dueCards(unlocked, progress).length
  const fresh = newCards(unlocked, progress).length
  const nextIndex = track.lessons.findIndex((l) => !progress.lessons[l.id])
  const done = track.lessons.filter((l) => progress.lessons[l.id]).length

  return (
    <div className="page">
      <nav className="crumbs">
        <a href={href({ name: 'home' })}>← {m.home}</a>
      </nav>
      <h1>{track.title}</h1>
      <p className="lead">{track.description}</p>
      <p className="muted">
        {m.lessonsDone(done, track.lessons.length)}
        {due ? ` · ${m.dueCount(due)}` : ''}
        {fresh ? ` · ${m.newCount(fresh)}` : ''}
      </p>
      <div className="actions">
        <a className="btn btn-primary" href={href({ name: 'practice', track: trackId })}>
          {m.startPractice}
        </a>
        <a className="btn btn-ghost" href={href({ name: 'challenge', track: trackId })}>
          ⏱ {m.challenge}
        </a>
        <a className="btn btn-ghost" href={href({ name: 'stats', track: trackId })}>
          {m.stats}
        </a>
        <a className="btn btn-ghost" href={href({ name: 'cheatsheet', track: trackId })}>
          {m.cheatSheet}
        </a>
      </div>

      <h2>{m.lessons}</h2>
      <ol className="lesson-list">
        {track.lessons.map((lesson, i) => {
          const isDone = !!progress.lessons[lesson.id]
          const isNext = i === nextIndex
          return (
            <li key={lesson.id}>
              <a className={`lesson-row ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`} href={href({ name: 'lesson', lessonId: lesson.id })}>
                <span className="lesson-no" aria-hidden="true">
                  {isDone ? '✓' : i}
                </span>
                <span className="lesson-text">
                  <span className="lesson-title">
                    {lesson.title}
                    {isNext ? <span className="badge badge-next">{m.lessonNext}</span> : null}
                  </span>
                  <span className="lesson-summary">{lesson.summary}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
