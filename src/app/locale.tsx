import { setCourseLocale } from '../content'
import { LOCALES, m, saveLocale, setMessagesLocale, type Locale } from '../i18n'

/** Switches UI strings and course content together. Callers re-render the app afterwards. */
export function applyLocale(next: Locale) {
  setMessagesLocale(next)
  setCourseLocale(next)
  document.documentElement.lang = next
  document.title = m.appName
}

export function LanguageSwitch({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <label className="language-switch">
      <span className="visually-hidden">{m.languageLabel}</span>
      <span aria-hidden="true">🌐</span>
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value as Locale
          applyLocale(next)
          saveLocale(next)
          onChange(next)
        }}
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  )
}
