'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import type { GenerationOptions } from './types'
import { IconButton, RollingValue, SegmentedControl } from './primitives'

export interface GenerationSettingsProps {
  value: GenerationOptions
  onChange: (value: GenerationOptions) => void
}

const ratios = ['1:1', '4:3', '3:4', '16:9'] as const

export function GenerationSettings({ value, onChange }: GenerationSettingsProps) {
  const ratioGroup = useId()
  const reducedMotion = useReducedMotion()
  return (
    <div className="iu-settings">
      <div className="iu-settings-heading">Image settings</div>
      <fieldset className="iu-ratio-field">
        <legend>Aspect ratio</legend>
        <div className="iu-ratios">
          {ratios.map((ratio) => (
            <label key={ratio} className={value.aspectRatio === ratio ? 'is-selected' : ''}>
              <input
                type="radio"
                name={ratioGroup}
                value={ratio}
                checked={value.aspectRatio === ratio}
                onChange={() => onChange({ ...value, aspectRatio: ratio })}
              />
              {value.aspectRatio === ratio ? (
                <motion.span
                  className="iu-ratio-highlight"
                  layoutId={`ratio-${ratioGroup}`}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 36 }
                  }
                />
              ) : null}
              <span className="iu-ratio-shape" style={{ aspectRatio: ratio.replace(':', '/') }} />
              <span>{ratio}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="iu-setting-row">
        <span>Quality</span>
        <SegmentedControl
          label="Image quality"
          value={value.quality}
          onChange={(quality) => onChange({ ...value, quality })}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'high', label: 'High' },
          ]}
        />
      </div>
      <div className="iu-setting-row">
        <span>Number of images</span>
        <div className="iu-stepper">
          <IconButton
            label="Fewer images"
            disabled={value.count <= 1}
            onClick={() => onChange({ ...value, count: value.count - 1 })}
          >
            <Minus size={13} />
          </IconButton>
          <output aria-live="polite">
            <RollingValue value={value.count} />
          </output>
          <IconButton
            label="More images"
            disabled={value.count >= 4}
            onClick={() => onChange({ ...value, count: value.count + 1 })}
          >
            <Plus size={13} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
