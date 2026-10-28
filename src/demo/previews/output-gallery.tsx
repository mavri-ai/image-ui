import { useState } from 'react'

import { OutputGallery } from '../../components/image-ui/output-gallery'

import { SegmentedControl } from '../../components/image-ui/primitives'
import type { GenerationOutput } from '../../components/image-ui/types'

const initialOutputs: GenerationOutput[] = [
  {
    id: 'one',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/summer-editorial.jpg`,
    alt: 'Summer editorial',
  },
  {
    id: 'two',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/fragrance-motion.jpg`,
    alt: 'Fragrance in motion',
  },
  {
    id: 'three',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/coffee-bagels.jpg`,
    alt: 'Coffee and bagels',
  },
  {
    id: 'four',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/pistachios.jpg`,
    alt: 'Pistachio study',
  },
]

export default function GalleryDemo() {
  const [items, setItems] = useState(initialOutputs)
  const [selected, setSelected] = useState<string[]>(['one'])
  const [mode, setMode] = useState('complete')
  function changeMode(next: string) {
    setMode(next)
    setSelected([])
    setItems(
      next === 'mixed'
        ? initialOutputs.map((item, i) =>
            i === 2
              ? { ...item, status: 'generating' }
              : i === 3
                ? { ...item, status: 'failed' }
                : item,
          )
        : initialOutputs,
    )
  }
  return (
    <>
      <div className="demo-stage demo-gallery-stage">
        <OutputGallery
          items={items}
          selected={selected}
          onSelectionChange={setSelected}
          onRetry={(id) =>
            setItems((current) =>
              current.map((item) => (item.id === id ? { ...item, status: 'complete' } : item)),
            )
          }
        />
      </div>
      <div className="demo-controls">
        <SegmentedControl
          label="Gallery state"
          value={mode}
          onChange={changeMode}
          options={[
            { value: 'complete', label: 'Complete' },
            { value: 'mixed', label: 'Mixed results' },
          ]}
        />
      </div>
    </>
  )
}
