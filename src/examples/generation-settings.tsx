import { useState } from 'react'
import { GenerationSettings } from '../components/image-ui/generation-settings'
import type { GenerationOptions } from '../components/image-ui/types'

export default function Example() {
  const [settings, setSettings] = useState<GenerationOptions>({
    aspectRatio: '4:3',
    quality: 'high',
    count: 1,
  })
  return <GenerationSettings value={settings} onChange={setSettings} />
}
