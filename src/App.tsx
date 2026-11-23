import { href, useRoute, type Route } from './app/router'
import { ProgressProvider } from './app/progress'
import { m } from './i18n'
import { HomePage } from './pages/HomePage'
import { TrackPage } from './pages/TrackPage'
import { LessonPage } from './pages/LessonPage'
import { PracticePage } from './pages/PracticePage'
import { ChallengePage } from './pages/ChallengePage'
import { StatsPage } from './pages/StatsPage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { NotFound } from './pages/NotFound'

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'track':
      return <TrackPage trackId={route.track} />
    case 'lesson':
      return <LessonPage lessonId={route.lessonId} />
    case 'practice':
      return <PracticePage scope={{ kind: 'track', trackId: route.track }} />
    case 'practice-lesson':
      return <PracticePage scope={{ kind: 'lesson', lessonId: route.lessonId }} />
    case 'practice-weak':
      return <PracticePage scope={{ kind: 'weak', trackId: route.track }} />
    case 'challenge':
      return <ChallengePage trackId={route.track} />
    case 'stats':
      return <StatsPage trackId={route.track} />
    case 'cheatsheet':
      return <CheatSheetPage trackId={route.track} />
    case 'notFound':
      return <NotFound />
  }
}

export function App() {
  const route = useRoute()
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
        {/* Keying by route remounts the page, so e.g. switching tracks starts a fresh round. */}
        <Page key={href(route)} route={route} />
      </main>
    </ProgressProvider>
  )
}
