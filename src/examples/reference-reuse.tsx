import { useState } from 'react'
import { ImageActions } from '../components/image-ui/image-actions'
import { ReferenceInput } from '../components/image-ui/reference-input'
import type { ReferenceImage } from '../components/image-ui/types'

const output = {
  id: 'desert-output',
  src: `${import.meta.env.BASE_URL}images/optimized/dunes-480.webp`,
  name: 'Desert result',
}
export default function ReferenceReuse() {
  const [references, setReferences] = useState<ReferenceImage[]>([])
  const [message, setMessage] = useState('Reuse a completed output without uploading it again.')
  function reuse() {
    if (references.some((reference) => reference.id === output.id)) {
      setMessage('This output is already a reference.')
      return
    }
    if (references.length >= 4) {
      setMessage('Remove a reference before adding another.')
      return
    }
    setReferences((all) => [...all, output])
    setMessage('Output added as a reference.')
  }
  return (
    <div className="workflow-demo">
      <img
        className="example-result"
        src={output.src}
        alt="Golden desert output"
        width="480"
        height="320"
      />
      <ImageActions
        src={output.src}
        alt="Golden desert output"
        fileName="desert.webp"
        onUseReference={reuse}
      />
      <ReferenceInput value={references} onChange={setReferences} />
      <p role="status">{message}</p>
    </div>
  )
}
