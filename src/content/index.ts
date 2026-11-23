import { buildCourse, type Course } from './course'
import { tracks as fiTracks } from './fi'
import { tracks as enTracks } from './en'
import type { Locale } from '../i18n'

/**
 * Courses per language. Content lives in src/content/<locale>/<track>/*.yaml, and every language
 * uses the same lesson and card ids, so progress carries over when the language changes.
 */
export const courses: Record<Locale, Course> = { fi: buildCourse(fiTracks), en: buildCourse(enTracks) }

/** The course in the active language. A live binding, swapped by setCourseLocale (see src/app/locale.tsx). */
export let course: Course = courses.fi

export function setCourseLocale(next: Locale) {
  course = courses[next]
}
