import { useState } from 'react'
import { VersionHistory } from '../components/image-ui/version-history'
import type { ImageVersion, GenerationOptions } from '../components/image-ui/types'

const versions: ImageVersion[] = [
  {
    id: 'v1',
    src: `${import.meta.env.BASE_URL}images/optimized/dunes-480.webp`,
    prompt: 'Golden desert dunes',
    model: 'demo',
    label: 'Version 01',
    createdAt: '2:40 PM',
    settings: { aspectRatio: '4:3', quality: 'high', count: 1 },
  },
  {
    id: 'v2',
    src: `${import.meta.env.BASE_URL}images/optimized/coast-480.webp`,
    prompt: 'A quiet coast at sunset',
    model: 'demo',
    label: 'Version 02',
    createdAt: '2:45 PM',
    settings: { aspectRatio: '16:9', quality: 'standard', count: 2 },
  },
]
export default function VersionRestoration() {
  const [selected, setSelected] = useState('v1')
  const [prompt, setPrompt] = useState('My current prompt')
  const [settings, setSettings] = useState<GenerationOptions>({
    aspectRatio: '1:1',
    quality: 'standard',
    count: 1,
  })
  const [restored, setRestored] = useState('')
  function restore() {
    const snapshot = versions.find((version) => version.id === selected)
    if (!snapshot) return
    setPrompt(snapshot.prompt)
    setSettings({ ...snapshot.settings })
    setRestored(snapshot.label)
  }
  return (
    <div className="workflow-demo">
      <VersionHistory versions={versions} value={selected} onChange={setSelected} />
      <label className="example-field">
        Current prompt
        <input value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      </label>
      <p>
        {settings.aspectRatio} · {settings.quality} · {settings.count} image(s)
      </p>
      <button type="button" className="doc-button" onClick={restore}>
        Restore selected version
      </button>
      <p role="status">
        {restored
          ? `${restored} restored. No new generation started.`
          : 'Selecting a version previews it. Restore explicitly to replace the current inputs.'}
      </p>
    </div>
  )
}
