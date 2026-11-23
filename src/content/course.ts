import { lessonSchema, type DeckCard, type Track, type TrackId, type AnswerLanguage } from './schema'

export type TrackSource = {
  id: TrackId
  title: string
  description: string
  language: AnswerLanguage
  /** Raw lesson data in course order (parsed YAML). */
  lessons: unknown[]
}

export type Course = {
  tracks: Track[]
  trackById: Map<TrackId, Track>
  deck: DeckCard[]
  cardById: Map<string, DeckCard>
}

/** Validates raw lesson data into a course. Throws with the lesson and field path on any problem. */
export function buildCourse(sources: TrackSource[]): Course {
  const ids = new Set<string>()
  const claim = (id: string, where: string) => {
    if (ids.has(id)) throw new Error(`${where}: duplicate id "${id}"`)
    ids.add(id)
  }

  const tracks: Track[] = sources.map((src) => ({
    ...src,
    lessons: src.lessons.map((raw, i) => {
      const result = lessonSchema.safeParse(raw)
      if (!result.success) {
        const issues = result.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')
        throw new Error(`${src.id} lesson #${i + 1}: ${issues}`)
      }
      const lesson = result.data
      claim(lesson.id, src.id)
      for (const card of lesson.cards) claim(card.id, lesson.id)
      return lesson
    }),
  }))

  const deck: DeckCard[] = tracks.flatMap((t) =>
    t.lessons.flatMap((l) =>
      l.cards.map((c) => ({ ...c, lessonId: l.id, lessonTitle: l.title, track: t.id, language: t.language })),
    ),
  )

  return {
    tracks,
    trackById: new Map(tracks.map((t) => [t.id, t])),
    deck,
    cardById: new Map(deck.map((c) => [c.id, c])),
  }
}
