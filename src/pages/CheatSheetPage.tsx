import { useState } from 'react'
import { course } from '../content'
import type { TrackId } from '../content/schema'
import { href } from '../app/router'
import { m } from '../i18n'
import { CodeBlock } from '../ui/CodeBlock'
import { Inline } from '../ui/Markdown'
import { codeLanguage } from '../ui/highlight'

/** Every card's prompt and model answer, grouped by lesson: a "How do I…?" reference. */
export function CheatSheetPage({ trackId }: { trackId: TrackId }) {
  const track = course.trackById.get(trackId)!
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const lang = codeLanguage(track.language)

  const sections = track.lessons
    .map((lesson) => ({
      lesson,
      cards: lesson.cards.filter(
        (c) => !q || [lesson.title, c.prompt, c.solution].some((s) => s.toLowerCase().includes(q)),
      ),
    }))
    .filter((s) => s.cards.length)

  return (
    <div className="page">
      <nav className="crumbs">
        <a href={href({ name: 'track', track: trackId })}>← {track.title}</a>
      </nav>
      <h1>
        {m.cheatSheet}: {track.title}
      </h1>
      <p className="lead">{m.cheatSheetIntro}</p>
      <label className="search">
        <span className="visually-hidden">{m.search}</span>
        <input type="search" value={query} placeholder={m.searchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {sections.length === 0 ? <p className="muted">{m.noResults}</p> : null}
      {sections.map(({ lesson, cards }) => (
        <section key={lesson.id} className="sheet-section">
          <h2>
            <a href={href({ name: 'lesson', lessonId: lesson.id })}>{lesson.title}</a>
          </h2>
          <dl className="sheet">
            {cards.map((c) => (
              <div key={c.id} className="sheet-item">
                <dt>
                  <Inline text={c.prompt} />
                </dt>
                <dd>
                  <CodeBlock code={c.solution} language={'language' in c && c.language ? codeLanguage(c.language) : lang} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
