import type { AnswerLanguage } from '../content/schema'
import { isPythonReady } from '../check/python'
import { m } from '../i18n'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/** Keyboard hint under the answer editor. */
export function submitHint(language: AnswerLanguage): string {
  return language === 'shell' ? m.submitHintShell : m.submitHintCode(isMac ? '⌘' : 'Ctrl')
}

export function answerPlaceholder(language: AnswerLanguage): string {
  return language === 'shell' ? m.answerPlaceholderShell : m.answerPlaceholderCode
}

/** Messages the checker shows for errors that aren't the learner's code. */
export function checkMessages() {
  return { timeout: m.timeout, loadFailed: m.pythonLoadFailed }
}

/** Label on the check button while checking. The first Python check also downloads the runtime. */
export function checkingLabel(language: AnswerLanguage): string {
  return language === 'python' && !isPythonReady() ? m.pythonLoading : m.checking
}
