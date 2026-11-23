import { course } from '../content'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { dueCards, newCards, unlockedCards } from '../session/buildRound'
import { currentStreak, emptyProgress, loadAttempts, localDay, resetAll } from '../storage/progress'
import { m } from '../i18n'

export function HomePage() {
  const { progress, replace } = useProgress()
  const streak = currentStreak(progress.streak)

  const exportAttempts = () => {
    const data = { exportedAt: new Date().toISOString(), progress, attempts: loadAttempts() }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `koodikoulu-vastaukset-${localDay(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    if (!confirm(m.resetConfirm)) return
    resetAll()
    replace(emptyProgress())
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>{m.appName}</h1>
        <p className="lead">{m.tagline}</p>
        {streak > 0 ? <p className="streak">🔥 {m.streak(streak)}</p> : null}
      </header>

      <div className="tracks">
        {course.tracks.map((track) => {
          const unlocked = unlockedCards(course.deck.filter((c) => c.track === track.id), progress)
          const due = dueCards(unlocked, progress).length
          const fresh = newCards(unlocked, progress).length
          const done = track.lessons.filter((l) => progress.lessons[l.id]).length
          const next = track.lessons.find((l) => !progress.lessons[l.id])
          return (
            <section key={track.id} className="track-card">
              <h2>
                <a href={href({ name: 'track', track: track.id })}>{track.title}</a>
              </h2>
              <p>{track.description}</p>
              <div className="meter" aria-hidden="true">
                <div style={{ width: `${(done / track.lessons.length) * 100}%` }} />
              </div>
              <p className="muted">
                {m.lessonsDone(done, track.lessons.length)}
                {due ? ` · ${m.dueCount(due)}` : ''}
                {fresh ? ` · ${m.newCount(fresh)}` : ''}
              </p>
              <div className="actions">
                {unlocked.length > 0 ? (
                  <a className="btn btn-primary" href={href({ name: 'practice', track: track.id })}>
                    {m.startPractice}
                  </a>
                ) : null}
                {next ? (
                  <a className={`btn ${unlocked.length > 0 ? 'btn-ghost' : 'btn-primary'}`} href={href({ name: 'lesson', lessonId: next.id })}>
                    {m.continueWith(next.title)}
                  </a>
                ) : (
                  <span className="muted">{m.allLessonsDone}</span>
                )}
                <a className="btn btn-ghost" href={href({ name: 'track', track: track.id })}>
                  {m.openTrack}
                </a>
              </div>
            </section>
          )
        })}
      </div>

      <section className="how">
        <h2>{m.howItWorks}</h2>
        <ol>
          {m.howItWorksSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <footer className="footer">
        <button className="btn btn-ghost" onClick={exportAttempts}>
          {m.exportAttempts}
        </button>
        <p className="muted small">{m.exportHelp}</p>
        <button className="btn btn-link danger" onClick={reset}>
          {m.resetProgress}
        </button>
      </footer>
    </div>
  )
}
