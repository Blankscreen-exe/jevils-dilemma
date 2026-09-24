import type { Expression } from './expressions'

export interface PokeReaction {
  line: string
  face: Expression
}

/** The poke that triggers the one-off special line. */
export const EASTER_EGG_POKE = 15

const PLAYFUL = [
  { line: 'UEE HEE! THAT TICKLES!', face: 'excited' },
  { line: 'OHO? A CURIOUS ONE!', face: 'smirk' },
  { line: 'AGAIN? AGAIN!', face: 'cheerful' },
  { line: 'CAREFUL! THE BELLS ARE DELICATE!', face: 'astonished' },
] as const satisfies readonly PokeReaction[]

const IRRITATED = [
  { line: 'POKE, POKE, POKE... HOW DULL.', face: 'disappointed' },
  { line: 'HEY! MIND THE HAT!', face: 'astonished' },
  { line: 'THOU ART STILL HERE?', face: 'smirk' },
  { line: 'I AM A JESTER, NOT A BUTTON!', face: 'flabbergasted' },
] as const satisfies readonly PokeReaction[]

const ANNOYED = [
  { line: 'ENOUGH! ...OR IS IT?', face: 'evil-smile' },
  { line: 'THOU TESTEST MY PATIENCE, PLAYMATE.', face: 'disappointed' },
  { line: 'KEEP POKING. SEE WHAT HAPPENS.', face: 'smirk' },
] as const satisfies readonly PokeReaction[]

const EASTER_EGG: PokeReaction = {
  line: 'FINE! THOU ART MORE STUBBORN THAN I! NOW GO AND PLAY!',
  face: 'excited',
}

/** Tiers by poke count; the first tier whose range contains the count is used. */
const TIERS = [
  { from: 1, to: 4, reactions: PLAYFUL },
  { from: 5, to: 9, reactions: IRRITATED },
  { from: 10, to: Infinity, reactions: ANNOYED },
] as const

/**
 * Jevil's reaction to the nth poke on the title screen (n starts at 1). He grows more
 * annoyed the more he is poked; within a tier the lines play in order, and neither the line
 * nor the face ever repeats twice in a row.
 */
export function pokeReaction(poke: number): PokeReaction {
  if (poke === EASTER_EGG_POKE) return EASTER_EGG
  const tier = TIERS.find(({ from, to }) => poke >= from && poke <= to) ?? TIERS[0]
  const reaction = tier.reactions[(Math.max(poke, 1) - tier.from) % tier.reactions.length]
  return reaction ?? tier.reactions[0]
}
