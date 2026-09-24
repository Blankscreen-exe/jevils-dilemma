import astonished from '../assets/jevil/astonished.png'
import cheerful from '../assets/jevil/cheerful.png'
import disappointed from '../assets/jevil/disappointed.png'
import evilSmile from '../assets/jevil/evil-smile.png'
import excited from '../assets/jevil/excited.png'
import flabbergasted from '../assets/jevil/flabbergasted.png'
import smile from '../assets/jevil/smile.png'
import smirk from '../assets/jevil/smirk.png'
import type { Expression } from '../game/expressions'

/** Native sprite size; the face is only ever scaled by whole numbers to stay crisp. */
export const FACE_WIDTH = 55
export const FACE_HEIGHT = 56

const SOURCES: Record<Expression, string> = {
  smile,
  cheerful,
  excited,
  disappointed,
  astonished,
  'evil-smile': evilSmile,
  smirk,
  flabbergasted,
}

interface JevilFaceProps {
  expression: Expression
  /** Whole-number scale of the 55 × 56 sprite. */
  scale: 1 | 2 | 3 | 4
  className?: string
}

export function JevilFace({ expression, scale, className }: JevilFaceProps) {
  return (
    <img
      src={SOURCES[expression]}
      width={FACE_WIDTH * scale}
      height={FACE_HEIGHT * scale}
      alt=""
      aria-hidden="true"
      draggable={false}
      data-expression={expression}
      className={`shrink-0 pixelated ${className ?? ''}`}
    />
  )
}
