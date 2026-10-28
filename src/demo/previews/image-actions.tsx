import { useState } from 'react'
import { Check } from 'lucide-react'
import { ImageActions } from '../../components/image-ui/image-actions'

export default function ActionsDemo() {
  const [src, setSrc] = useState(`${import.meta.env.BASE_URL}images/optimized/dunes-960.webp`)
  const [reference, setReference] = useState(false)
  return (
    <>
      <div className="demo-stage demo-actions-stage">
        <div className="demo-actions-image">
          <img
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            src={src}
            alt="A sunlit landscape study"
          />
          <ImageActions
            fileName="image-ui-output.webp"
            src={src}
            alt="A sunlit landscape study"
            onRetry={() => {
              setSrc((current) =>
                current === `${import.meta.env.BASE_URL}images/optimized/dunes-960.webp`
                  ? `${import.meta.env.BASE_URL}images/optimized/desert-960.webp`
                  : `${import.meta.env.BASE_URL}images/optimized/dunes-960.webp`,
              )
              setReference(false)
            }}
            onUseReference={() => setReference(true)}
          />
        </div>
      </div>
      {reference ? (
        <div className="demo-action-feedback" role="status">
          <Check size={11} />
          Added as a reference
        </div>
      ) : null}
    </>
  )
}
