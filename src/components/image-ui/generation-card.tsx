'use client'

import { GenerationShimmer } from './generation-shimmer'
import { RollingValue } from './primitives'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Image,
  LoaderCircle,
  RotateCcw,
  Square,
  X,
} from 'lucide-react'
import type { GenerationStatus } from './types'
import { Button, IconButton } from './primitives'

export interface GenerationCardProps {
  status: GenerationStatus
  src?: string
  alt?: string
  title?: string
  model?: string
  error?: string
  progress?: number
  onGenerate?: () => void
  onRetry?: () => void
  onCancel?: () => void
  onOpen?: () => void
  className?: string
}

const statusLabels: Record<GenerationStatus, string> = {
  idle: 'Ready to generate',
  queued: 'Waiting in queue',
  generating: 'Generating image',
  complete: 'Generation complete',
  failed: 'Generation failed',
  cancelled: 'Generation cancelled',
}

export function GenerationCard({
  status,
  src,
  alt = 'Generated image',
  title = 'Untitled generation',
  model,
  error = 'The model took too long to respond. Your prompt and references are safe.',
  progress,
  onGenerate,
  onRetry,
  onCancel,
  onOpen,
  className = '',
}: GenerationCardProps) {
  const reducedMotion = useReducedMotion()
  const boundedProgress = progress === undefined ? undefined : Math.max(0, Math.min(100, progress))
  return (
    <div className={`iu-generation-card ${className}`} data-status={status}>
      <div className="iu-generation-header">
        <span>
          <Image size={13} />
          {title}
        </span>
        <span className={`iu-status-dot iu-status-dot--${status}`} />
      </div>
      <div className="iu-generation-viewport">
        <AnimatePresence initial={false}>
          {status === 'complete' && src ? (
            <motion.div
              key="complete"
              className="iu-generation-result"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
            >
              <img src={src} alt={alt} />
              {onOpen ? (
                <IconButton label="Expand image" className="iu-expand-image" onClick={onOpen}>
                  <ArrowUpRight size={16} />
                </IconButton>
              ) : null}
            </motion.div>
          ) : status === 'generating' ? (
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
              <div
                className="iu-generation-field-progress"
                role="progressbar"
                aria-label="Generation progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={boundedProgress}
                aria-valuetext={boundedProgress === undefined ? 'Generating image' : undefined}
              >
                {boundedProgress !== undefined ? (
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: boundedProgress / 100 }}
                    transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
                  />
                ) : null}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={status}
              className="iu-generation-placeholder"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`iu-generation-symbol iu-generation-symbol--${status}`}>
                {status === 'failed' ? (
                  <CircleAlert />
                ) : status === 'cancelled' ? (
                  <X />
                ) : status === 'queued' ? (
                  <LoaderCircle className="iu-spin" />
                ) : (
                  <Image />
                )}
              </div>
              <span className="iu-state-title">{statusLabels[status]}</span>
              <p>
                {status === 'failed'
                  ? error
                  : status === 'idle'
                    ? 'Add a prompt and select a model.'
                    : status === 'queued'
                      ? 'Your generation will start shortly.'
                      : status === 'cancelled'
                        ? 'Your prompt and settings are preserved.'
                        : 'Rendering your image…'}
              </p>
              {(status === 'failed' || status === 'cancelled') && onRetry ? (
                <Button onClick={onRetry}>
                  <RotateCcw size={13} />
                  Try again
                </Button>
              ) : null}
              {status === 'idle' && onGenerate ? (
                <Button variant="primary" onClick={onGenerate}>
                  <Image size={12} />
                  Generate image
                </Button>
              ) : null}
              {status === 'queued' && onCancel ? (
                <Button variant="ghost" onClick={onCancel}>
                  <Square size={10} />
                  Cancel
                </Button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="iu-generation-footer">
        <span>{model ?? 'Image generation'}</span>
        <div className="iu-generation-footer-state">
          <span role="status">
            {status === 'complete' ? (
              <>
                <Check size={12} />
                Complete
              </>
            ) : status === 'generating' && boundedProgress !== undefined ? (
              <RollingValue value={`${Math.round(boundedProgress)}%`} />
            ) : status === 'generating' ? (
              'Generating…'
            ) : status === 'queued' ? (
              'Queued'
            ) : status === 'failed' ? (
              'Needs a retry'
            ) : status === 'cancelled' ? (
              'Cancelled'
            ) : (
              'Ready'
            )}
          </span>
          {status === 'generating' && onCancel ? (
            <button type="button" className="iu-generation-stop" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
