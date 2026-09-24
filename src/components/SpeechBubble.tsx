import type { ReactNode } from 'react'

interface SpeechBubbleProps {
  /** Nothing is shown while null; the live region stays mounted so updates are announced. */
  children: ReactNode | null
  /**
   * Where the speaker is: to the left, below, or above on phones and to the left from the
   * `sm` breakpoint (for layouts that stack on narrow screens).
   */
  tail?: 'left' | 'down' | 'up-then-left'
  /** Let the bubble fill its container instead of capping its width. */
  wide?: boolean
  className?: string
}

const TAILS = {
  left: 'bottom-2 -left-3 border-r-bone',
  down: '-bottom-3 left-1/2 -translate-x-1/2 border-t-bone',
  'up-then-left':
    '-top-3 left-10 border-b-bone sm:top-auto sm:bottom-2 sm:-left-3 sm:border-b-transparent sm:border-r-bone',
} as const

export function SpeechBubble({ children, tail = 'left', wide, className }: SpeechBubbleProps) {
  const empty = children === null || children === ''
  return (
    <div
      aria-live="polite"
      className={`relative bg-bone px-3.5 py-2.5 font-display text-[11px] leading-relaxed text-void pixel-border pixel-border-bone ${wide ? '' : 'max-w-72'} ${empty ? 'invisible' : ''} ${className ?? ''}`}
    >
      {children}
      <span aria-hidden="true" className={`absolute border-6 border-transparent ${TAILS[tail]}`} />
    </div>
  )
}
