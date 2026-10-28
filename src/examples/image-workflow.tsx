import { useState } from 'react'
import { PromptComposer } from '../components/image-ui/prompt-composer'
import { GenerationCard } from '../components/image-ui/generation-card'
import { OutputGallery } from '../components/image-ui/output-gallery'
import { useDemoGeneration } from '../demo/use-demo-generation'
import type {
  GenerationOptions,
  GenerationOutput,
  ImageModel,
  ReferenceImage,
} from '../components/image-ui/types'

const models: ImageModel[] = [
  {
    id: 'demo',
    name: 'Demo model',
    provider: 'Local simulation',
    description: 'No provider calls',
    mark: 'D',
    color: '#6882af',
  },
]

export default function ImageWorkflow() {
  const [prompt, setPrompt] = useState('Desert dunes in afternoon light')
  const [model, setModel] = useState('demo')
  const [references, setReferences] = useState<ReferenceImage[]>([])
  const [settings, setSettings] = useState<GenerationOptions>({
    aspectRatio: '4:3',
    quality: 'high',
    count: 1,
  })
  const [outputs, setOutputs] = useState<GenerationOutput[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const job = useDemoGeneration('idle', () => {
    setOutputs([
      {
        id: 'result',
        status: 'complete',
        src: `${import.meta.env.BASE_URL}images/dunes.jpg`,
        alt: submittedPrompt,
      },
    ])
  })
  const busy = job.status === 'queued' || job.status === 'generating'
  function generate() {
    setSubmittedPrompt(prompt.trim())
    setOutputs([])
    setSelected([])
    job.run()
  }
  return (
    <div className="workflow-demo">
      <PromptComposer
        value={prompt}
        onChange={setPrompt}
        models={models}
        model={model}
        onModelChange={setModel}
        references={references}
        onReferencesChange={setReferences}
        settings={settings}
        onSettingsChange={setSettings}
        busy={busy}
        onGenerate={generate}
        onCancel={job.cancel}
      />
      <GenerationCard
        title="Your generation"
        status={job.status}
        progress={job.progress}
        src={`${import.meta.env.BASE_URL}images/dunes.jpg`}
        alt={submittedPrompt || 'Demo desert dunes'}
        onRetry={generate}
        onCancel={job.cancel}
      />
      {busy ? (
        <button type="button" className="doc-button" onClick={() => job.chooseStatus('failed')}>
          Simulate failure
        </button>
      ) : null}
      {outputs.length ? (
        <OutputGallery items={outputs} selected={selected} onSelectionChange={setSelected} />
      ) : null}
      <p role="status">
        {job.status === 'cancelled'
          ? 'Cancelled. Your prompt and references are preserved.'
          : 'Local simulation. No images are sent to a provider.'}
      </p>
    </div>
  )
}
