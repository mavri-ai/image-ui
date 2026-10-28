import { useEffect, useRef, useState } from 'react'
import { OutputGallery } from '../components/image-ui/output-gallery'
import type { GenerationOutput } from '../components/image-ui/types'

const initial: GenerationOutput[] = [
  {
    id: 'one',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/optimized/dunes-480.webp`,
    alt: 'Golden dunes',
  },
  { id: 'two', status: 'failed', error: 'This variation timed out', alt: 'Desert variation' },
  {
    id: 'three',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/optimized/coast-480.webp`,
    alt: 'Quiet coast',
  },
]
export default function PartialFailures() {
  const [items, setItems] = useState(initial)
  const [selected, setSelected] = useState<string[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )
  function retry(id: string) {
    if (timers.current.has(id)) return
    setItems((all) =>
      all.map((item) =>
        item.id === id ? { ...item, status: 'generating', error: undefined } : item,
      ),
    )
    timers.current.set(
      id,
      setTimeout(() => {
        setItems((all) =>
          all.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'complete',
                  src: `${import.meta.env.BASE_URL}images/optimized/desert-480.webp`,
                }
              : item,
          ),
        )
        timers.current.delete(id)
      }, 1200),
    )
  }
  return (
    <div className="workflow-demo">
      <OutputGallery
        items={items}
        selected={selected}
        onSelectionChange={setSelected}
        onRetry={retry}
      />
      <p role="status">
        {items.some((item) => item.status === 'generating')
          ? 'Retrying only the failed output.'
          : 'Successful outputs stay available. This is a local simulation.'}
      </p>
    </div>
  )
}
