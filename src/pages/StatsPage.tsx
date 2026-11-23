import { course } from '../content'
import type { TrackId } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { cardStats, rankWeakest, weakness } from '../session/weak'
import { currentStreak, loadAttempts } from '../storage/progress'
import { State } from 'ts-fsrs'
import { m } from '../i18n'
import { Inline } from '../ui/Markdown'

/** How many of the weakest cards to list. */
const LIST_SIZE = 10

export function StatsPage({ trackId }: { trackId: TrackId }) {
  const { progress } = useProgress()
  const track = course.trackById.get(trackId)!
  const deck = course.deck.filter((c) => c.track === trackId)
  const ids = new Set(deck.map((c) => c.id))
  const attempts = loadAttempts().filter((a) => ids.has(a.cardId))

  const stats = cardStats(deck, progress, attempts)
  const weakest = rankWeakest(stats)
    .filter((s) => weakness(s) > 0)
    .slice(0, LIST_SIZE)
  const answers = attempts.filter((a) => !a.override)
  const overrides = attempts.filter((a) => a.override).length
  const correct = answers.filter((a) => a.correct).length + overrides
  const learned = deck.filter((c) => progress.cards[c.id]?.state === State.Review).length
  const best = progress.challengeBest[trackId]

  const summary: [string, string][] = [
    [m.statsPracticed, `${stats.length}/${deck.length}`],
    [m.statsLearned, String(learned)],
    [m.statsAnswers, String(answers.length)],
    [m.statsAccuracy, answers.length ? `${Math.round((correct / answers.length) * 100)} %` : '–'],
    [m.statsStreak, String(currentStreak(progress.streak))],
    [m.challengeBest, best !== undefined ? String(best) : '–'],
  ]

  return (
    <div className="page">
      <nav className="crumbs">
        <a href={href({ name: 'track', track: trackId })}>← {track.title}</a>
      </nav>
      <h1>
        {m.stats}: {track.title}
      </h1>

      <dl className="summary">
        {summary.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h2>{m.weakCards}</h2>
      {weakest.length === 0 ? (
        <p className="muted">{answers.length ? m.weakNone : m.weakNothingYet}</p>
      ) : (
        <>
          <p className="muted">{m.weakIntro}</p>
          <ol className="weak-list">
            {weakest.map((s) => (
              <li key={s.card.id}>
                <span className="weak-prompt">
                  <Inline text={s.card.prompt} />
                </span>
                <span className="muted small">
                  {s.card.lessonTitle} · {m.missedOf(s.misses, s.attempts)}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
      <div className="actions">
        {stats.length > 0 ? (
          <a className="btn btn-primary" href={href({ name: 'practice-weak', track: trackId })}>
            {m.practiceWeak}
          </a>
        ) : null}
        <a className="btn btn-ghost" href={href({ name: 'challenge', track: trackId })}>
          {m.challenge}
        </a>
      </div>
    </div>
  )
}
