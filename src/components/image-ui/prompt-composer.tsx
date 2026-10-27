'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Popover } from 'radix-ui'
import { ArrowUp, Image, ImagePlus, SlidersHorizontal, Square, X } from 'lucide-react'
import type { GenerationOptions, ImageModel, ReferenceImage } from './types'
import { ModelPicker } from './model-picker'
import { GenerationSettings } from './generation-settings'
import { ReferenceInput } from './reference-input'
import { IconButton, RollingValue } from './primitives'

export interface PromptComposerProps {
  value: string
  onChange: (value: string) => void
  onGenerate: () => void
  onCancel?: () => void
  busy?: boolean
  models: ImageModel[]
  model: string
  onModelChange: (id: string) => void
  settings: GenerationOptions
  onSettingsChange: (settings: GenerationOptions) => void
  references: ReferenceImage[]
  onReferencesChange: (references: ReferenceImage[]) => void
}

export function PromptComposer({
  value,
  onChange,
  onGenerate,
  onCancel,
  busy = false,
  models,
  model,
  onModelChange,
  settings,
  onSettingsChange,
  references,
  onReferencesChange,
}: PromptComposerProps) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  return (
    <div className="iu-composer">
      <div className="iu-composer-label">
        <Image size={12} /> Image prompt
      </div>
      {references.length ? (
        <div className="iu-composer-references">
          <AnimatePresence initial={false}>
            {references.map((reference, i) => (
              <motion.div
                key={reference.id}
                className="iu-composer-reference"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <img src={reference.src} alt="" />
                <span aria-label={`Reference ${String.fromCharCode(65 + i)}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <IconButton
                  label={`Remove reference ${String.fromCharCode(65 + i)}`}
                  onClick={() =>
                    onReferencesChange(references.filter((item) => item.id !== reference.id))
                  }
                >
                  <X size={11} />
                </IconButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}
      <textarea
        ref={textarea}
        aria-label="Image prompt"
        placeholder="Describe an image…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && value.trim() && !busy) {
            event.preventDefault()
            onGenerate()
          }
        }}
      />
      <div className="iu-composer-toolbar">
        <div className="iu-composer-tools">
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconButton label="Attach references">
                <ImagePlus size={17} />
              </IconButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="iu-popover iu-reference-popover"
                align="start"
                sideOffset={8}
                collisionPadding={16}
                aria-label="Prompt references"
              >
                <ReferenceInput value={references} onChange={onReferencesChange} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <span className="iu-toolbar-divider" />
          <ModelPicker models={models} value={model} onChange={onModelChange} />
        </div>
        <div className="iu-composer-tools">
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconButton label="Generation settings" className="iu-settings-summary">
                <SlidersHorizontal size={13} />
                <RollingValue value={settings.aspectRatio} />
              </IconButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="iu-popover"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                aria-label="Generation settings"
                onOpenAutoFocus={(event) => {
                  event.preventDefault()
                  const panel = event.currentTarget as HTMLElement
                  panel.focus()
                }}
                tabIndex={-1}
              >
                <GenerationSettings value={settings} onChange={onSettingsChange} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {busy ? (
            <IconButton label="Cancel generation" className="iu-submit" onClick={onCancel}>
              <Square size={12} />
            </IconButton>
          ) : (
            <IconButton
              label="Generate image"
              className="iu-submit"
              disabled={!value.trim()}
              onClick={onGenerate}
            >
              <ArrowUp size={17} />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  )
}
