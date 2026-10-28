import { useState } from 'react'
import { Check } from 'lucide-react'

import { PromptComposer } from '../../components/image-ui/prompt-composer'

import { SegmentedControl } from '../../components/image-ui/primitives'

import { composerPrompt, composerReferences, defaultSettings, models } from '../data'
import { useDemoGeneration } from '../use-demo-generation'

export default function PromptDemo() {
  const [prompt, setPrompt] = useState(composerPrompt)
  const [model, setModel] = useState(models[0].id)
  const [settings, setSettings] = useState(defaultSettings)
  const [references, setReferences] = useState(composerReferences)
  const [example, setExample] = useState('reference')
  const generation = useDemoGeneration('idle')
  const busy = generation.status === 'queued' || generation.status === 'generating'
  return (
    <>
      <div className="demo-stage demo-prompt-stage">
        <div className="demo-prompt-wrap">
          <PromptComposer
            value={prompt}
            onChange={setPrompt}
            model={model}
            onModelChange={setModel}
            models={models}
            settings={settings}
            onSettingsChange={setSettings}
            references={references}
            onReferencesChange={setReferences}
            onGenerate={generation.run}
            onCancel={generation.cancel}
            busy={busy}
          />
          <div className="demo-prompt-status" role="status">
            {generation.status === 'complete' ? (
              <>
                <Check size={11} />
                Demo complete
              </>
            ) : busy ? (
              <>
                <span className="demo-busy-dot" />
                {generation.status === 'queued' ? 'Queued' : 'Generating image…'}
              </>
            ) : generation.status === 'cancelled' ? (
              'Cancelled. Prompt and settings preserved.'
            ) : (
              <>
                <kbd>⌘</kbd>
                <kbd>↵</kbd>
                <span>to generate</span>
              </>
            )}
          </div>
          {generation.status === 'complete' ? (
            <div className="demo-prompt-result">
              <img
                src={references[0]?.src ?? `${import.meta.env.BASE_URL}images/trail-boot.jpg`}
                alt={`Demo reference preview for: ${prompt}`}
              />
              <span>Reference preview · simulated generation</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="demo-controls">
        <SegmentedControl
          label="Prompt example"
          value={example}
          onChange={(next) => {
            setExample(next)
            setReferences(next === 'reference' ? composerReferences : [])
            setPrompt(next === 'reference' ? composerPrompt : '')
            generation.chooseStatus('idle')
          }}
          options={[
            { value: 'reference', label: 'With reference' },
            { value: 'empty', label: 'Empty' },
          ]}
        />
      </div>
    </>
  )
}
