'use client'

import { Check, CircleAlert, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { GenerationShimmer } from './generation-shimmer'
import type { GenerationOutput } from './types'
import { Button, RollingValue } from './primitives'

export interface OutputGalleryProps {
  items: GenerationOutput[]
  selected: string[]
  onSelectionChange: (ids: string[]) => void
  onRetry?: (id: string) => void
}

export function OutputGallery({ items, selected, onSelectionChange, onRetry }: OutputGalleryProps) {
  const reducedMotion = useReducedMotion()
  return (
    <div className="iu-output-gallery">
      <div className="iu-field-heading">
        <span>Outputs</span>
        <RollingValue
          value={selected.length ? `${selected.length} selected` : `${items.length} outputs`}
        />
      </div>
      <div className="iu-output-grid">
        {items.map((item, i) => (
          <motion.div
            layout
            key={item.id}
            className={`iu-output-item ${selected.includes(item.id) ? 'is-selected' : ''}`}
          >
            {item.status === 'complete' && item.src ? (
              <button
                type="button"
                onClick={() =>
                  onSelectionChange(
                    selected.includes(item.id)
                      ? selected.filter((id) => id !== item.id)
                      : [...selected, item.id],
                  )
                }
                aria-pressed={selected.includes(item.id)}
                aria-label={`Select ${item.alt}`}
              >
                <img src={item.src} alt={item.alt} />
                <span className="iu-output-selection">
                  {selected.includes(item.id) ? <Check size={12} /> : null}
                </span>
                <span className="iu-output-number">0{i + 1}</span>
              </button>
            ) : item.status === 'failed' ? (
              <div className="iu-output-state">
                <CircleAlert size={19} />
                <span>{item.error ?? 'Generation failed'}</span>
                {onRetry ? (
                  <Button variant="ghost" onClick={() => onRetry(item.id)}>
                    <RotateCcw size={12} />
                    Retry
                  </Button>
                ) : null}
              </div>
            ) : null}
            <AnimatePresence initial={false}>
              {item.status === 'generating' ? (
                <motion.div
                  key="generating"
                  className="iu-generation-field"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] },
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.25 }}
                >
                  <GenerationShimmer />
                  <span className="iu-output-generating-label" role="status">
                    Generating…
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <p className="iu-field-hint">Select one or more outputs.</p>
    </div>
  )
}
