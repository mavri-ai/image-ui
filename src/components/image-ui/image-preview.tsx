'use client'

import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { useRef } from 'react'
import { IconButton } from './primitives'

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
  const content = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="iu-dialog-overlay" />
        <Dialog.Content
          ref={content}
          className="iu-lightbox"
          tabIndex={-1}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            returnFocus.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null
            content.current?.focus({ preventScroll: true })
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
