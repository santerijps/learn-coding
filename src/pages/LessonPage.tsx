import { useState } from 'react'
import { course } from '../content'
import type { Exercise, Track } from '../content/schema'
import { href } from '../app/router'
import { useProgress } from '../app/progress'
import { m } from '../i18n'
import { Markdown } from '../ui/Markdown'
import { codeLanguage } from '../ui/highlight'
import { ChoiceExercise } from '../exercises/ChoiceExercise'
import { BlankExercise } from '../exercises/BlankExercise'
import { BugExercise } from '../exercises/BugExercise'
import { NotFound } from './NotFound'

type Phase = { name: 'theory' } | { name: 'exercises'; index: number } | { name: 'done' }

export function LessonPage({ lessonId }: { lessonId: string }) {
  const { progress, update } = useProgress()
  const [phase, setPhase] = useState<Phase>({ name: 'theory' })

  const track = course.tracks.find((t) => t.lessons.some((l) => l.id === lessonId))
  const index = track?.lessons.findIndex((l) => l.id === lessonId) ?? -1
  const lesson = track?.lessons[index]
  if (!track || !lesson) return <NotFound />

  const nextLesson = track.lessons[index + 1]
  const lang = codeLanguage(track.language)
  const completed = !!progress.lessons[lesson.id]

  const complete = () => {
    update((p) => (p.lessons[lesson.id] ? p : { ...p, lessons: { ...p.lessons, [lesson.id]: new Date().toISOString() } }))
    setPhase({ name: 'done' })
    window.scrollTo(0, 0)
  }

  return (
    <article className="page lesson">
      <nav className="crumbs">
        <a href={href({ name: 'track', track: track.id })}>← {track.title}</a>
      </nav>
      <p className="eyebrow">
        {m.lessonNumber(index + 1)}
        {completed ? <span className="badge badge-done">{m.lessonDone}</span> : null}
      </p>
      <h1>{lesson.title}</h1>

      {phase.name === 'theory' ? (
        <>
          <p className="lead">{lesson.summary}</p>
          <Markdown source={lesson.theory} codeFallback={lang} />
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setPhase({ name: 'exercises', index: 0 })}>
              {m.toExercises}
            </button>
            {completed ? (
              <a className="btn btn-ghost" href={href({ name: 'practice-lesson', lessonId: lesson.id })}>
                {m.practiceLesson}
              </a>
            ) : (
              <button className="btn btn-ghost" onClick={complete}>
                {m.skipLesson}
              </button>
            )}
          </div>
        </>
      ) : null}

      {phase.name === 'exercises' ? (
        <section>
          <p className="eyebrow">
            {m.exerciseCounter(phase.index + 1, lesson.exercises.length)} ·{' '}
            {m.exerciseKind[lesson.exercises[phase.index]!.type]}
          </p>
          <ExerciseView
            key={phase.index}
            exercise={lesson.exercises[phase.index]!}
            track={track}
            onNext={() =>
              phase.index + 1 < lesson.exercises.length ? setPhase({ name: 'exercises', index: phase.index + 1 }) : complete()
            }
          />
        </section>
      ) : null}

      {phase.name === 'done' ? (
        <section className="done-panel">
          <h2>{m.lessonComplete}</h2>
          <p>{m.cardsUnlocked(lesson.cards.length)}</p>
          <div className="actions">
            <a className="btn btn-primary" href={href({ name: 'practice-lesson', lessonId: lesson.id })} autoFocus>
              {m.practiceLesson}
            </a>
            <a className="btn btn-ghost" href={href({ name: 'practice', track: track.id })}>
              {m.practiceAllLessons}
            </a>
            {nextLesson ? (
              <a className="btn btn-ghost" href={href({ name: 'lesson', lessonId: nextLesson.id })}>
                {m.nextLesson(nextLesson.title)}
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </article>
  )
}

function ExerciseView({ exercise, track, onNext }: { exercise: Exercise; track: Track; onNext: () => void }) {
  const lang = codeLanguage(track.language)
  switch (exercise.type) {
    case 'choice':
      return <ChoiceExercise exercise={exercise} codeLanguage={lang} onNext={onNext} />
    case 'blank':
      return <BlankExercise exercise={exercise} language={track.language} codeLanguage={lang} onNext={onNext} />
    case 'bug':
      return <BugExercise exercise={exercise} codeLanguage={lang} onNext={onNext} />
  }
}
