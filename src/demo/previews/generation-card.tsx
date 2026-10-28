import { useState } from 'react'
import { Play } from 'lucide-react'
import { GenerationCard } from '../../components/image-ui/generation-card'

import { ImagePreview } from '../../components/image-ui/image-preview'
import { Button, SegmentedControl } from '../../components/image-ui/primitives'
import type { GenerationStatus } from '../../components/image-ui/types'

import { useDemoGeneration } from '../use-demo-generation'

const stateOptions: { value: GenerationStatus; label: string }[] = [
  { value: 'idle', label: 'Idle' },
  { value: 'queued', label: 'Queued' },
  { value: 'generating', label: 'Generating' },
  { value: 'complete', label: 'Complete' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function GenerationDemo() {
  const generation = useDemoGeneration('complete')
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="demo-stage demo-generation-stage">
        <GenerationCard
          loading="eager"
          fetchPriority="high"
          status={generation.status}
          progress={
            generation.status === 'generating' && generation.progress
              ? generation.progress
              : undefined
          }
          src={`${import.meta.env.BASE_URL}images/lamp-chess.jpg`}
          alt="A warm table lamp illuminating a chessboard"
          title="Image 01"
          model="GPT Image 2"
          onGenerate={generation.run}
          onRetry={generation.run}
          onCancel={generation.cancel}
          onOpen={() => setOpen(true)}
        />
      </div>
      <div className="demo-controls">
        <SegmentedControl
          label="Generation state"
          value={generation.status}
          onChange={generation.chooseStatus}
          options={stateOptions}
        />
        <Button variant="ghost" onClick={generation.run}>
          <Play size={10} />
          Play
        </Button>
      </div>
      <ImagePreview
        src={`${import.meta.env.BASE_URL}images/lamp-chess.jpg`}
        alt="A warm table lamp illuminating a chessboard"
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
