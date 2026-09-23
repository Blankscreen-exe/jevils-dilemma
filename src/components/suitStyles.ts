import type { Suit } from '../game/deck'

/** Text colour per suit, from the theme palette. */
export const SUIT_TEXT: Record<Suit, string> = {
  hearts: 'text-chaos',
  diamonds: 'text-gold',
  clubs: 'text-teal',
  spades: 'text-jester-300',
}
