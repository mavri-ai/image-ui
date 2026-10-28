import { useState } from 'react'
import { OutputGallery } from '../components/image-ui/output-gallery'
import type { GenerationOutput } from '../components/image-ui/types'

const outputs: GenerationOutput[] = [
  {
    id: 'first',
    status: 'complete',
    src: `${import.meta.env.BASE_URL}images/dunes.jpg`,
    alt: 'Golden desert dunes',
  },
  { id: 'second', status: 'generating', alt: 'Second variation' },
]

export default function Example() {
  const [selected, setSelected] = useState<string[]>([])
  return <OutputGallery items={outputs} selected={selected} onSelectionChange={setSelected} />
}
