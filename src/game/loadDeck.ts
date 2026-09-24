import { deckSchema, type Card } from './deck'

/**
 * Loads and validates the question deck. The four suit files are imported dynamically so
 * the ~1 MB of question text is split out of the main bundle and fetched in parallel after
 * the title screen has rendered. They are still precached by the service worker, so the
 * game works offline after the first visit.
 */
export async function loadDeck(): Promise<readonly Card[]> {
  const suits = await Promise.all([
    import('../data/cards/hearts.json'),
    import('../data/cards/diamonds.json'),
    import('../data/cards/clubs.json'),
    import('../data/cards/spades.json'),
  ])
  return deckSchema.parse(suits.flatMap((suit) => suit.default))
}
