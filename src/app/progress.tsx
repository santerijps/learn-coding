import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { loadProgress, saveProgress, type Progress } from '../storage/progress'

type ProgressApi = {
  progress: Progress
  /** Applies a change and saves it. */
  update: (change: (p: Progress) => Progress) => void
  /** Replaces progress (used after a reset). */
  replace: (p: Progress) => void
}

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress)

  const update = useCallback((change: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = change(prev)
      saveProgress(next)
      return next
    })
  }, [])

  const replace = useCallback((p: Progress) => {
    saveProgress(p)
    setProgress(p)
  }, [])

  return <ProgressContext.Provider value={{ progress, update, replace }}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressApi {
  const api = useContext(ProgressContext)
  if (!api) throw new Error('useProgress must be used inside ProgressProvider')
  return api
}
