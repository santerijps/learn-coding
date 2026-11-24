import type { Lesson } from '../content/schema'
import type { Progress } from '../storage/progress'

/**
 * The lesson to suggest next: the first one not yet completed. Lesson 0 (installing the tools) is
 * skipped once any later lesson is done, so learners who started before it existed, or who
 * already have the tools, aren't sent back to it.
 */
export function nextLesson(lessons: Lesson[], progress: Progress): Lesson | undefined {
  const isDone = (l: Lesson) => !!progress.lessons[l.id]
  const pastSetup = lessons.slice(1).some(isDone)
  return lessons.find((l, i) => !isDone(l) && !(i === 0 && pastSetup))
}
