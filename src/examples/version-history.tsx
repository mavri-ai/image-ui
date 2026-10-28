import { useState } from 'react'
import { VersionHistory } from '../components/image-ui/version-history'
import type { ImageVersion } from '../components/image-ui/types'

const versions: ImageVersion[] = [
  {
    id: 'v1',
    src: `${import.meta.env.BASE_URL}images/dunes.jpg`,
    label: 'Version 01',
    prompt: 'Desert dunes in afternoon light',
    model: 'Your model',
    settings: { aspectRatio: '4:3', quality: 'high', count: 1 },
    createdAt: '2:40 PM',
  },
]

export default function Example() {
  const [version, setVersion] = useState('v1')
  return <VersionHistory versions={versions} value={version} onChange={setVersion} />
}
