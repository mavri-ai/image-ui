import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { GenerationSettings } from '../../components/image-ui/generation-settings'

import { Button } from '../../components/image-ui/primitives'

import { defaultSettings } from '../data'

export default function SettingsDemo() {
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
