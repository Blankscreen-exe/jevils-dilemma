import type { Card, Suit } from '../game/deck'

/**
 * A valid card for tests. Normal answers are Lawful Evil (a), True Neutral (b) and
 * Chaotic Good (c), which satisfies the one-of-each-score rule on both axes. CHAOS answers
 * are Lawful Good (w), Chaotic Good (x), Lawful Evil (y) and Chaotic Evil (z).
 */
export function makeCard(id: string, suit: Suit = 'hearts'): Card {
  return {
    id,
    suit,
    prompt: `${id}?`,
    options: [
      { id: 'a', text: `${id} A`, chaos: -1, good: -1 },
      { id: 'b', text: `${id} B`, chaos: 0, good: 0 },
      { id: 'c', text: `${id} C`, chaos: 1, good: 1 },
    ],
    chaosOptions: [
      { id: 'w', text: `${id} W`, chaos: -1, good: 1 },
      { id: 'x', text: `${id} X`, chaos: 1, good: 1 },
      { id: 'y', text: `${id} Y`, chaos: -1, good: -1 },
      { id: 'z', text: `${id} Z`, chaos: 1, good: -1 },
    ],
  }
}
