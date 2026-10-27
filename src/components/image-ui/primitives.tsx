'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react'

export function Button({
  children,
  className = '',
  variant = 'secondary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button type="button" className={`iu-button iu-button--${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function IconButton({
  label,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`iu-icon-button ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly { value: T; label: ReactNode }[]
  label: string
}) {
  const id = useId()
  const reducedMotion = useReducedMotion()
  return (
    <div className="iu-segments" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {value === option.value ? (
            <motion.span
              className="iu-segment-highlight"
              layoutId={`segment-${id}`}
              transition={
                reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
              }
            />
          ) : null}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Shared rolling transition for changing values; static on first render. */
export function RollingValue({ value }: { value: string | number }) {
  const reducedMotion = useReducedMotion()
  return (
    <span className="iu-rolling-value">
      <span className="iu-rolling-accessible">{value}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="iu-rolling-digit"
          aria-hidden="true"
          initial={
            reducedMotion ? false : { y: '65%', rotateX: -35, opacity: 0, filter: 'blur(2px)' }
          }
          animate={{ y: '0%', rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { y: '-65%', rotateX: 35, opacity: 0, filter: 'blur(2px)' }
          }
          transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
