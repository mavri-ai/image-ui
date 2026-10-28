import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { ReferenceInput } from '../../components/image-ui/reference-input'

import { Button } from '../../components/image-ui/primitives'

import { referenceImages } from '../data'

export default function ReferenceDemo() {
  const [references, setReferences] = useState(referenceImages)
  return (
    <>
      <div className="demo-stage">
        <div className="demo-reference-wrap">
          <ReferenceInput value={references} onChange={setReferences} />
        </div>
      </div>
      <div className="demo-controls">
        <Button
          variant="ghost"
          onClick={() => setReferences(references.length ? [] : referenceImages)}
        >
          <RotateCcw size={11} />
          {references.length ? 'Try empty state' : 'Restore references'}
        </Button>
      </div>
    </>
  )
}
