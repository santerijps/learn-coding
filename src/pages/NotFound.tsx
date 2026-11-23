import { href } from '../app/router'
import { m } from '../i18n'

export function NotFound() {
  return (
    <div className="page">
      <p>{m.notFound}</p>
      <a className="btn btn-ghost" href={href({ name: 'home' })}>
        {m.home}
      </a>
    </div>
  )
}
