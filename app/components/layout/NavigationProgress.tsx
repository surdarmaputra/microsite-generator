'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

type Stage = 'hidden' | 'growing' | 'completing'

export function NavigationProgress() {
  const isPending = useRouterState({ select: (s) => s.status === 'pending' })
  const [stage, setStage] = useState<Stage>('hidden')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isPending) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setStage('growing')
    } else if (stage === 'growing') {
      setStage('completing')
      timerRef.current = setTimeout(() => setStage('hidden'), 500)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPending]) // eslint-disable-line react-hooks/exhaustive-deps -- stage intentionally excluded

  if (stage === 'hidden') return null

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-accent"
      style={
        stage === 'completing'
          ? { width: '100%', opacity: 0, transition: 'width 0.2s ease-out, opacity 0.3s ease-out 0.1s' }
          : { width: '0%', animation: 'nav-progress-grow 20s ease-out forwards' }
      }
    />
  )
}
