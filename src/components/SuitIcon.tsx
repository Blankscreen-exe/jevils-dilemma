import clubs from '../assets/suits/clubs.png'
import diamonds from '../assets/suits/diamonds.png'
import hearts from '../assets/suits/hearts.png'
import spades from '../assets/suits/spades.png'
import type { Suit } from '../game/deck'

const SOURCES: Record<Suit, string> = { hearts, diamonds, clubs, spades }

interface SuitIconProps {
  suit: Suit
  className?: string
}

/**
 * Pixel suit symbol, tinted with the current text colour. The PNG is used as a mask at its
 * exact size (18 × 18) because browsers do not reliably keep masks crisp when scaling them.
 */
export function SuitIcon({ suit, className }: SuitIconProps) {
  const mask = `url(${SOURCES[suit]})`
  return (
    <span
      aria-hidden="true"
      data-suit={suit}
      className={`inline-block size-[18px] shrink-0 bg-current align-middle ${className ?? ''}`}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    />
  )
}
