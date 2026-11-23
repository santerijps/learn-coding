import { useState } from 'react'

/** After this many wrong answers the correct answer is revealed, so nobody gets stuck. */
export const MAX_WRONG = 2

export type ExerciseStatus = 'answering' | 'solved' | 'revealed'

/** Shared state for the understanding-check exercises: wrong-answer count and resolution. */
export function useAttempts() {
  const [wrong, setWrong] = useState(0)
  const [status, setStatus] = useState<ExerciseStatus>('answering')

  const answer = (correct: boolean) => {
    if (status !== 'answering') return
    if (correct) return setStatus('solved')
    const w = wrong + 1
    setWrong(w)
    if (w >= MAX_WRONG) setStatus('revealed')
  }

  return { wrong, status, answer, done: status !== 'answering' }
}
