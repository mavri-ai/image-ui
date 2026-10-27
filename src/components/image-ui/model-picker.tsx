'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Popover } from 'radix-ui'
import { Check, ChevronDown, Search } from 'lucide-react'
import { RollingValue } from './primitives'
import type { ImageModel } from './types'

export interface ModelPickerProps {
  models: ImageModel[]
  value: string
  onChange: (id: string) => void
  inline?: boolean
}

export function ModelMark({ model }: { model: ImageModel }) {
  return (
    <span className="iu-model-mark" aria-hidden="true">
      {model.logo ? (
        <img
          src={model.logo}
          alt=""
          className={model.monochromeLogo ? 'iu-model-logo--monochrome' : undefined}
        />
      ) : (
        model.mark
      )}
    </span>
  )
}

function ModelPickerLabel({ name }: { name: string }) {
  const measure = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number>()
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const element = measure.current
    if (!element) return
    const updateWidth = () => setWidth(element.getBoundingClientRect().width)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)
    return () => observer.disconnect()
  }, [name])

  return (
    <motion.span
      className="iu-model-trigger-label"
      initial={false}
      animate={{ width }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span ref={measure} className="iu-model-trigger-measure" aria-hidden="true">
        {name}
      </span>
      <RollingValue value={name} />
    </motion.span>
  )
}

function ModelOptions({
  models,
  value,
  onChange,
  search,
  onSearchChange,
}: ModelPickerProps & { search: string; onSearchChange: (search: string) => void }) {
  const highlightId = useId()
  const reducedMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)
  const results = models.filter((model) =>
    `${model.name} ${model.provider}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div
      className="iu-model-options"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('.iu-model-option'),
        )
        if (!buttons.length) return
        event.preventDefault()
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next =
          current < 0
            ? event.key === 'ArrowDown'
              ? 0
              : buttons.length - 1
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
        buttons[next].focus()
      }}
    >
      <label className="iu-model-search">
        <Search size={14} />
        <input
          aria-label="Search models"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search models…"
        />
      </label>
      <div className="iu-model-list" onMouseLeave={() => setActiveId(null)}>
        {results.map((model) => (
          <button
            type="button"
            key={model.id}
            className="iu-model-option"
            aria-pressed={model.id === value}
            onClick={() => onChange(model.id)}
            onMouseEnter={() => setActiveId(model.id)}
            onFocus={() => setActiveId(model.id)}
            onBlur={() => setActiveId(null)}
          >
            {activeId === model.id ? (
              <motion.span
                className="iu-model-highlight"
                layoutId={`model-hover-${highlightId}`}
                transition={
                  reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }
                }
              />
            ) : null}
            <ModelMark model={model} />
            <span className="iu-model-copy">
              <strong>{model.name}</strong>
              <small>{model.description}</small>
            </span>
            <span className="iu-model-check">
              {model.id === value ? <Check size={13} /> : null}
            </span>
          </button>
        ))}
      </div>
      {!results.length ? <p className="iu-no-results">No models found. Try another name.</p> : null}
    </div>
  )
}

export function ModelPicker({ models, value, onChange, inline = false }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = models.find((model) => model.id === value) ?? models[0]
  const selectedId = selected?.id
  useEffect(() => {
    if (selectedId && selectedId !== value) onChange(selectedId)
  }, [selectedId, value, onChange])
  const select = (id: string) => {
    onChange(id)
    setOpen(false)
    setSearch('')
  }
  if (inline)
    return (
      <div className="iu-model-panel">
        <ModelOptions
          models={models}
          value={selectedId ?? ''}
          onChange={select}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
    )
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <Popover.Trigger
        className="iu-model-trigger"
        aria-label={`Select model, ${selected?.name ?? 'none selected'}`}
      >
        {selected ? <ModelMark model={selected} /> : null}
        <ModelPickerLabel name={selected?.name ?? 'Choose model'} />
        <ChevronDown size={12} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="iu-popover iu-model-popover"
          sideOffset={8}
          align="start"
          collisionPadding={16}
          aria-label="Choose an image model"
        >
          <ModelOptions
            models={models}
            value={selectedId ?? ''}
            onChange={select}
            search={search}
            onSearchChange={setSearch}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
