import { buildCourse } from './course'
import { tracks } from './fi'

/** The course in the active language. Content lives in src/content/<locale>/<track>/*.yaml. */
export const course = buildCourse(tracks)
