import { lazy, Suspense, useEffect, useState } from 'react'
import { Check, Play, RotateCcw } from 'lucide-react'
import { GenerationCard } from '../components/image-ui/generation-card'
import { ReferenceInput } from '../components/image-ui/reference-input'
import { ModelPicker } from '../components/image-ui/model-picker'
import { PromptComposer } from '../components/image-ui/prompt-composer'
import { GenerationSettings } from '../components/image-ui/generation-settings'
import { OutputGallery } from '../components/image-ui/output-gallery'
import { VersionHistory } from '../components/image-ui/version-history'
import { ImagePreview } from '../components/image-ui/image-preview'
import { Button, SegmentedControl } from '../components/image-ui/primitives'
import type { GenerationOutput, GenerationStatus } from '../components/image-ui/types'
import {
  composerPrompt,
  composerReferences,
  defaultSettings,
  models,
  referenceImages,
  versions,
} from './data'
import { useDemoGeneration } from './use-demo-generation'

const CanvasDemo = lazy(() => import('./canvas-demo'))
const stateOptions: { value: GenerationStatus; label: string }[] = [
  { value: 'idle', label: 'Idle' },
  { value: 'queued', label: 'Queued' },
  { value: 'generating', label: 'Generating' },
  { value: 'complete', label: 'Complete' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function GenerationDemo() {
  const generation = useDemoGeneration('queued')
  useEffect(() => {
    generation.run()
  }, [generation.run])
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="demo-stage demo-generation-stage">
        <GenerationCard
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

export function ReferenceDemo() {
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

export function PromptDemo() {
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

export function ModelDemo() {
  const [value, setValue] = useState(models[0].id)
  const [mode, setMode] = useState('inline')
  return (
    <>
      <div className="demo-stage demo-model-stage">
        {mode === 'inline' ? (
          <ModelPicker inline models={models} value={value} onChange={setValue} />
        ) : (
          <div className="demo-model-field">
            <span>Image model</span>
            <ModelPicker models={models} value={value} onChange={setValue} />
          </div>
        )}
      </div>
      <div className="demo-controls">
        <SegmentedControl
          label="Model picker variant"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'inline', label: 'Inline' },
            { value: 'popover', label: 'Popover' },
          ]}
        />
      </div>
    </>
  )
}

export function SettingsDemo() {
  const [settings, setSettings] = useState(defaultSettings)
  return (
    <>
      <div className="demo-stage demo-settings-stage">
        <GenerationSettings value={settings} onChange={setSettings} />
      </div>
      <div className="demo-controls">
        <Button variant="ghost" onClick={() => setSettings(defaultSettings)}>
          <RotateCcw size={11} />
          Reset
        </Button>
      </div>
    </>
  )
}

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

export function GalleryDemo() {
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

export function HistoryDemo() {
  const [version, setVersion] = useState('v2')
  return (
    <div className="demo-stage demo-history-stage">
      <VersionHistory versions={versions} value={version} onChange={setVersion} />
    </div>
  )
}

export function CanvasSectionDemo() {
  return (
    <Suspense fallback={<div className="canvas-loading">Loading canvas…</div>}>
      <CanvasDemo />
    </Suspense>
  )
}
