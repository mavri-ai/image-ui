import { useState } from 'react'
import { ReferenceInput } from '../components/image-ui/reference-input'
import type { ReferenceImage } from '../components/image-ui/types'

export default function Example() {
  const [images, setImages] = useState<ReferenceImage[]>([])
  return <ReferenceInput value={images} onChange={setImages} maxFiles={4} maxSizeMB={10} />
}
