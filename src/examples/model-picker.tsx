import { useState } from 'react'
import { ModelPicker } from '../components/image-ui/model-picker'
import type { ImageModel } from '../components/image-ui/types'

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
  const [model, setModel] = useState(models[0].id)
  return <ModelPicker models={models} value={model} onChange={setModel} />
}
