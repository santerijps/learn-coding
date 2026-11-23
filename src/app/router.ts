import { useEffect, useState } from 'react'
import { TRACK_IDS, type TrackId } from '../content/schema'

/** Hash-based routes, so the static GitHub Pages site needs no server-side routing. Route names are the URL segments. */
type TrackPage = 'track' | 'practice' | 'practice-weak' | 'challenge' | 'stats' | 'cheatsheet'
type LessonPage = 'lesson' | 'practice-lesson'

export type Route =
  | { name: 'home' }
  | { name: TrackPage; track: TrackId }
  | { name: LessonPage; lessonId: string }
  | { name: 'notFound' }

const TRACK_PAGES: TrackPage[] = ['track', 'practice', 'practice-weak', 'challenge', 'stats', 'cheatsheet']
const LESSON_PAGES: LessonPage[] = ['lesson', 'practice-lesson']

const isTrack = (s: string | undefined): s is TrackId => TRACK_IDS.some((t) => t === s)

export function parseRoute(hash: string): Route {
  const [page, arg] = hash.replace(/^#\/?/, '').split('/')
  if (!page) return { name: 'home' }
  const trackPage = TRACK_PAGES.find((p) => p === page)
  if (trackPage && isTrack(arg)) return { name: trackPage, track: arg }
  const lessonPage = LESSON_PAGES.find((p) => p === page)
  if (lessonPage && arg) return { name: lessonPage, lessonId: decodeURIComponent(arg) }
  return { name: 'notFound' }
}

export function href(route: Route): string {
  if (route.name === 'home' || route.name === 'notFound') return '#/'
  if ('lessonId' in route) return `#/${route.name}/${encodeURIComponent(route.lessonId)}`
  return `#/${route.name}/${route.track}`
}

export function navigate(route: Route) {
  location.hash = href(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
