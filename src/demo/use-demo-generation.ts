import { useCallback, useEffect, useRef, useState } from 'react'
import type { GenerationStatus } from '../components/image-ui/types'

// Only the showcase simulates work. Library components receive state from your app.
export function useDemoGeneration(initial: GenerationStatus = 'complete', onComplete?: () => void) {
  const [status, setStatus] = useState<GenerationStatus>(initial)
  const [progress, setProgress] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])
  useEffect(() => clear, [clear])

  const chooseStatus = useCallback(
    (next: GenerationStatus) => {
      clear()
      setProgress(0)
      setStatus(next)
    },
    [clear],
  )
  const run = useCallback(() => {
    clear()
    setStatus('queued')
    setProgress(0)
    timers.current.push(setTimeout(() => setStatus('generating'), 650))
    for (let i = 1; i <= 10; i++)
      timers.current.push(setTimeout(() => setProgress(i * 10), 650 + i * 240))
    timers.current.push(
      setTimeout(() => {
        setStatus('complete')
        onComplete?.()
      }, 3250),
    )
  }, [clear, onComplete])
  return { status, progress, run, chooseStatus, cancel: () => chooseStatus('cancelled') }
}
