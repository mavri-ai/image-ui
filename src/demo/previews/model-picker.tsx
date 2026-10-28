import { useState } from 'react'

import { ModelPicker } from '../../components/image-ui/model-picker'

import { SegmentedControl } from '../../components/image-ui/primitives'

import { models } from '../data'

export default function ModelDemo() {
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
