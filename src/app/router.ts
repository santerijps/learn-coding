import { useEffect, useState } from 'react'
import type { TrackId } from '../content/schema'

/** Hash-based routes, so the static GitHub Pages site needs no server-side routing. */
export type Route =
  | { name: 'home' }
  | { name: 'track'; track: TrackId }
  | { name: 'lesson'; lessonId: string }
  | { name: 'practice'; track: TrackId }
  | { name: 'cheatsheet'; track: TrackId }
  | { name: 'notFound' }

const isTrack = (s: string | undefined): s is TrackId => s === 'js' || s === 'git'

export function parseRoute(hash: string): Route {
  const [page, arg] = hash.replace(/^#\/?/, '').split('/')
  if (!page) return { name: 'home' }
  if (page === 'track' && isTrack(arg)) return { name: 'track', track: arg }
  if (page === 'practice' && isTrack(arg)) return { name: 'practice', track: arg }
  if (page === 'cheatsheet' && isTrack(arg)) return { name: 'cheatsheet', track: arg }
  if (page === 'lesson' && arg) return { name: 'lesson', lessonId: decodeURIComponent(arg) }
  return { name: 'notFound' }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
    case 'notFound':
      return '#/'
    case 'lesson':
      return `#/lesson/${encodeURIComponent(route.lessonId)}`
    default:
      return `#/${route.name}/${route.track}`
  }
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
