'use client'

import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ImagePlus, Plus, Upload, X } from 'lucide-react'
import type { ReferenceImage } from './types'
import { IconButton, RollingValue } from './primitives'

export interface ReferenceInputProps {
  value: ReferenceImage[]
  onChange: (images: ReferenceImage[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('This image could not be read. Try another file.'))
    reader.readAsDataURL(file)
  })
}

export function ReferenceInput({
  value,
  onChange,
  maxFiles = 4,
  maxSizeMB = 10,
}: ReferenceInputProps) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const id = useId()

  async function addFiles(files: File[]) {
    if (!files.length || reading) return
    setError('')
    if (files.length + value.length > maxFiles) {
      setError(`You can add up to ${maxFiles} reference images.`)
      return
    }
    if (files.some((file) => !imageTypes.includes(file.type))) {
      setError('Choose a PNG, JPG, WebP, or AVIF image.')
      return
    }
    if (files.some((file) => file.size > maxSizeMB * 1024 * 1024)) {
      setError(`Each image must be under ${maxSizeMB} MB.`)
      return
    }
    setReading(true)
    try {
      const images = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          src: await readImage(file),
        })),
      )
      onChange([...value, ...images])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add your images.')
    } finally {
      setReading(false)
    }
  }

  return (
    <div
      className="iu-reference-input"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        void addFiles(Array.from(event.dataTransfer.files))
      }}
    >
      <div className="iu-field-heading">
        <span>
          <ImagePlus size={14} />
          References
        </span>
        <span>
          <RollingValue value={value.length} /> / {maxFiles}
        </span>
      </div>
      <div className={`iu-reference-drop ${dragging ? 'is-dragging' : ''}`}>
        {value.length ? (
          <div className="iu-reference-grid">
            <AnimatePresence initial={false}>
              {value.map((image, i) => (
                <motion.div
                  key={image.id}
                  className="iu-reference-thumb"
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.18 }}
                >
                  <img src={image.src} alt={image.name} />
                  <div className="iu-reference-meta">
                    <strong>{image.name}</strong>
                    <small>Reference {String.fromCharCode(65 + i)}</small>
                  </div>
                  <IconButton
                    label={`Remove ${image.name}`}
                    disabled={reading}
                    onClick={() => onChange(value.filter((item) => item.id !== image.id))}
                  >
                    <X size={11} />
                  </IconButton>
                </motion.div>
              ))}
            </AnimatePresence>
            {value.length < maxFiles ? (
              <button
                type="button"
                className="iu-reference-add"
                disabled={reading}
                onClick={() => input.current?.click()}
                aria-label="Add reference image"
              >
                <Plus size={20} />
                <span>Add image</span>
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className="iu-reference-empty"
            disabled={reading}
            onClick={() => input.current?.click()}
          >
            <Upload size={22} />
            <span>Drop reference images</span>
            <small>or click to upload</small>
          </button>
        )}
        <input
          ref={input}
          id={id}
          aria-label="Upload reference images"
          type="file"
          accept={imageTypes.join(',')}
          multiple
          hidden
          onChange={(event) => {
            void addFiles(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
      </div>
      <p className="iu-field-hint" role={error ? 'alert' : undefined}>
        {error ||
          (reading
            ? 'Reading your images…'
            : `PNG, JPG, WebP or AVIF · Up to ${maxSizeMB} MB each`)}
      </p>
    </div>
  )
}
