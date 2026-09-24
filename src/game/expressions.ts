import type { Alignment } from './alignment'
import type { Pace } from './copy'

export const EXPRESSIONS = [
  'smile',
  'cheerful',
  'excited',
  'disappointed',
  'astonished',
  'evil-smile',
  'smirk',
  'flabbergasted',
] as const

export type Expression = (typeof EXPRESSIONS)[number]

/** Jevil's resting face while a card waits for a pick. */
export const IDLE_EXPRESSION: Expression = 'smile'

/** Jevil's face on the title screen. */
export const TITLE_EXPRESSION: Expression = 'cheerful'

/** Jevil's face when the CHAOS card is dealt. */
export const CHAOS_EXPRESSION: Expression = 'evil-smile'

/**
 * Jevil's face after a pick. Like his lines, it follows how fast the player chose,
 * never the hidden scores, so it gives nothing away.
 */
export function expressionForPace(pace: Pace): Expression {
  switch (pace) {
    case 'quick':
      return 'excited'
    case 'steady':
      return 'smirk'
    case 'slow':
      return 'flabbergasted'
  }
}

/** Jevil's face on the reading, reacting to where the player landed. */
export function expressionForAlignment({ ethic, moral }: Alignment): Expression {
  if (moral === 'evil') return 'evil-smile'
  if (moral === 'good') return ethic === 'chaotic' ? 'cheerful' : 'disappointed'
  if (ethic === 'chaotic') return 'excited'
  if (ethic === 'lawful') return 'disappointed'
  return 'astonished'
}
