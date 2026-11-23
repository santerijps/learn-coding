import { useEffect, useRef } from 'react'
import { EditorState, Prec, type Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { indentUnit, syntaxHighlighting } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { classHighlighter } from '@lezer/highlight'
import type { AnswerLanguage } from '../content/schema'

type Props = {
  language: AnswerLanguage
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  ariaLabel: string
  autoFocus?: boolean
}

/**
 * The answer editor. Autocomplete and auto-closing brackets are left out on purpose: the learner
 * must recall every character. JavaScript is multi-line (Ctrl/Cmd+Enter submits); shell commands
 * are single-line (Enter submits). Remount with a new `key` to clear it.
 */
export function Editor({ language, onChange, onSubmit, placeholder, ariaLabel, autoFocus = true }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const handlers = useRef({ onChange, onSubmit })
  handlers.current = { onChange, onSubmit }

  useEffect(() => {
    const submit = () => {
      handlers.current.onSubmit()
      return true
    }
    const extensions: Extension[] = [
      history(),
      Prec.highest(
        keymap.of(language === 'shell' ? [{ key: 'Enter', run: submit }, { key: 'Mod-Enter', run: submit }] : [{ key: 'Mod-Enter', run: submit }]),
      ),
      keymap.of([...defaultKeymap, ...historyKeymap, ...(language === 'js' ? [indentWithTab] : [])]),
      indentUnit.of('  '),
      EditorView.lineWrapping,
      placeholderExt(placeholder),
      syntaxHighlighting(classHighlighter),
      EditorView.contentAttributes.of({
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': ariaLabel,
      }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) handlers.current.onChange(u.state.doc.toString())
      }),
    ]
    if (language === 'js') extensions.push(javascript())
    if (language === 'shell') {
      // Commands are one line: drop any line breaks (e.g. from a paste).
      extensions.push(EditorState.transactionFilter.of((tr) => (tr.newDoc.lines > 1 ? [] : tr)))
    }
    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({ doc: '', extensions }),
    })
    if (autoFocus) view.focus()
    return () => view.destroy()
  }, [language, placeholder, ariaLabel, autoFocus])

  return <div ref={host} className={`editor editor-${language}`} />
}
