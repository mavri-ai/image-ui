'use client'

import { RollingValue } from './primitives'

import { useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, History } from 'lucide-react'
import type { ImageVersion } from './types'

export interface VersionHistoryProps {
  versions: ImageVersion[]
  value: string
  onChange: (id: string) => void
}

export function VersionHistory({ versions, value, onChange }: VersionHistoryProps) {
  const selectionId = useId()
  const reducedMotion = useReducedMotion()
  const detailsRef = useRef<HTMLDivElement>(null)
  const [detailsHeight, setDetailsHeight] = useState<number>()
  useLayoutEffect(() => {
    const element = detailsRef.current
    if (!element) return
    const update = () => setDetailsHeight(element.getBoundingClientRect().height)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [value, versions.length])
  const selected = versions.find((version) => version.id === value)
  if (!selected) return <p className="iu-field-hint">No versions yet.</p>
  return (
    <div className="iu-version-history">
      <div className="iu-field-heading">
        <span>
          <History size={14} />
          Version history
        </span>
        <span>
          <RollingValue value={versions.length} /> versions
        </span>
      </div>
      <div className="iu-history-image">
        <AnimatePresence initial={false}>
          <motion.img
            key={selected.id}
            src={selected.src}
            alt={selected.prompt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.35, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <span>
          <RollingValue value={selected.label} />
          <Check size={12} />
        </span>
      </div>
      <div className="iu-history-strip">
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            className={value === version.id ? 'is-selected' : ''}
            aria-label={`View ${version.label}`}
            aria-pressed={value === version.id}
            onClick={() => onChange(version.id)}
          >
            {value === version.id ? (
              <motion.div
                className="iu-history-selection"
                layoutId={`history-${selectionId}`}
                transition={
                  reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                }
              />
            ) : null}
            <img src={version.src} alt="" />
            <span>{version.label}</span>
          </button>
        ))}
      </div>
      <motion.div
        className="iu-history-details"
        initial={false}
        animate={{ height: detailsHeight }}
        transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div ref={detailsRef} className="iu-history-details-content">
          <AnimatePresence initial={false}>
            <motion.div
              key={selected.id}
              initial={reducedMotion ? false : { opacity: 0, y: 4, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>{selected.prompt}</p>
              <span>
                {selected.model}
                <i />
                {selected.settings.aspectRatio}
                <i />
                {selected.settings.quality}
                <i />
                {selected.createdAt}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
