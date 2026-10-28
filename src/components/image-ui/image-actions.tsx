'use client'

import { Dialog } from 'radix-ui'
import { Check, Download, Expand, ImagePlus, RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { IconButton } from './primitives'

export interface ImageActionsProps {
  src: string
  alt: string
  onRetry?: () => void
  onUseReference?: () => void
  fileName?: string
}

export function ImagePreview({
  src,
  alt,
  open,
  onOpenChange,
}: {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const returnFocus = useRef<HTMLElement | null>(null)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="iu-dialog-overlay" />
        <Dialog.Content
          className="iu-lightbox"
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            returnFocus.current?.focus()
          }}
        >
          <Dialog.Title className="iu-visually-hidden">{alt}</Dialog.Title>
          <img src={src} alt={alt} />
          <Dialog.Close asChild>
            <IconButton label="Close image preview">
              <X size={20} />
            </IconButton>
          </Dialog.Close>
          <span className="iu-lightbox-caption">{alt}</span>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ImageActions({
  src,
  alt,
  onRetry,
  onUseReference,
  fileName = 'image-ui-output.jpg',
}: ImageActionsProps) {
  const [open, setOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  async function download() {
    setDownloadError(false)
    try {
      const response = await fetch(src)
      if (!response.ok) throw new Error('Download failed')
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownloaded(true)
    } catch {
      setDownloadError(true)
    }
  }
  return (
    <>
      <div className="iu-image-actions">
        <IconButton label="Preview image" onClick={() => setOpen(true)}>
          <Expand size={15} />
        </IconButton>
        <span className="iu-toolbar-divider" />
        {onUseReference ? (
          <IconButton label="Use as reference" onClick={onUseReference}>
            <ImagePlus size={16} />
          </IconButton>
        ) : null}
        {onRetry ? (
          <IconButton label="Create a variation" onClick={onRetry}>
            <RotateCcw size={14} />
          </IconButton>
        ) : null}
        <IconButton
          label={downloaded ? 'Download image again' : 'Download image'}
          onClick={() => void download()}
        >
          {downloaded ? <Check size={15} /> : <Download size={15} />}
        </IconButton>
      </div>
      {downloadError ? (
        <span role="alert" className="iu-field-hint">
          Couldn’t download. Please try again.
        </span>
      ) : null}
      <ImagePreview src={src} alt={alt} open={open} onOpenChange={setOpen} />
    </>
  )
}
