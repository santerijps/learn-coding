import { href, useRoute } from './app/router'
import { ProgressProvider } from './app/progress'
import { m } from './i18n'
import { HomePage } from './pages/HomePage'
import { TrackPage } from './pages/TrackPage'
import { LessonPage } from './pages/LessonPage'
import { PracticePage } from './pages/PracticePage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { NotFound } from './pages/NotFound'

export function App() {
  const route = useRoute()
  // Keying by route remounts the page, so e.g. switching tracks starts a fresh round.
  const key = href(route)
  return (
    <ProgressProvider>
      <header className="topbar">
        <a className="brand" href={href({ name: 'home' })}>
          <span className="brand-mark" aria-hidden="true">
            {'{ }'}
          </span>
          {m.appName}
        </a>
      </header>
      <main>
        {route.name === 'home' ? <HomePage key={key} /> : null}
        {route.name === 'track' ? <TrackPage key={key} trackId={route.track} /> : null}
        {route.name === 'lesson' ? <LessonPage key={key} lessonId={route.lessonId} /> : null}
        {route.name === 'practice' ? <PracticePage key={key} trackId={route.track} /> : null}
        {route.name === 'cheatsheet' ? <CheatSheetPage key={key} trackId={route.track} /> : null}
        {route.name === 'notFound' ? <NotFound /> : null}
      </main>
    </ProgressProvider>
  )
}
