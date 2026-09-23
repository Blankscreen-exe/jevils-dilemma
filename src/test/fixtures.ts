import type { Card, Suit } from '../game/deck'

/**
 * A valid card for tests. Answers are Lawful Evil (a), True Neutral (b) and
 * Chaotic Good (c), which satisfies the one-of-each-score rule on both axes.
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
  }
}
