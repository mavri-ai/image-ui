import { useState } from 'react'
import { PromptComposer } from '../components/image-ui/prompt-composer'
import type { GenerationOptions, ImageModel, ReferenceImage } from '../components/image-ui/types'
import { useDemoGeneration } from '../demo/use-demo-generation'

const models: ImageModel[] = [
  {
    id: 'your-model',
    name: 'Your model',
    provider: 'Your provider',
    description: 'Configured by your application',
    mark: 'Y',
    color: '#6882af',
  },
]

export default function Example() {
  const [prompt, setPrompt] = useState('Desert dunes in soft afternoon light')
  const [model, setModel] = useState(models[0].id)
  const [references, setReferences] = useState<ReferenceImage[]>([])
  const [settings, setSettings] = useState<GenerationOptions>({
    aspectRatio: '4:3',
    quality: 'high',
    count: 1,
  })
  const job = useDemoGeneration('idle')
  return (
    <PromptComposer
      value={prompt}
      onChange={setPrompt}
      models={models}
      model={model}
      onModelChange={setModel}
      settings={settings}
      onSettingsChange={setSettings}
      references={references}
      onReferencesChange={setReferences}
      busy={job.status === 'queued' || job.status === 'generating'}
      onGenerate={job.run}
      onCancel={job.cancel}
    />
  )
}
