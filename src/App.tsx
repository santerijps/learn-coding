import { useState } from 'react'
import { href, useRoute, type Route } from './app/router'
import { ProgressProvider } from './app/progress'
import { ThemeToggle } from './app/theme'
import { LanguageSwitch } from './app/locale'
import { locale as initialLocale, m } from './i18n'
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
  // The active language lives in module-level bindings (m, course); this state re-renders on change.
  const [locale, setLocale] = useState(initialLocale)
  return (
    <ProgressProvider>
      <header className="topbar">
        <a className="brand" href={href({ name: 'home' })}>
          <span className="brand-mark" aria-hidden="true">
            {'{ }'}
          </span>
          <span className="brand-name">{m.appName}</span>
        </a>
        <div className="topbar-controls">
          <LanguageSwitch value={locale} onChange={setLocale} />
          <ThemeToggle key={locale} />
        </div>
      </header>
      <main>
        {/* Keying by route (and language) remounts the page, so e.g. switching tracks starts a fresh round. */}
        <Page key={`${locale}:${href(route)}`} route={route} />
      </main>
    </ProgressProvider>
  )
}
