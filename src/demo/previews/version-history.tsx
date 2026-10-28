import { useState } from 'react'

import { VersionHistory } from '../../components/image-ui/version-history'

import { versions } from '../data'

export default function HistoryDemo() {
  const [version, setVersion] = useState('v2')
  return (
    <div className="demo-stage demo-history-stage">
      <VersionHistory versions={versions} value={version} onChange={setVersion} />
    </div>
  )
}
