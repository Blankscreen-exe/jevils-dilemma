import { describe, expect, it } from 'vitest'
import rawCards from '../data/cards.json'
import { makeCard } from '../test/fixtures'
import { CARDS_PER_RUN, MIN_PER_SUIT, SUITS, deck, deckSchema, type Card } from './deck'

/** A valid deck: enough cards overall, spread across every suit. */
const deckOf = (count: number): Card[] =>
  Array.from({ length: count }, (_, i) => makeCard(`card-${i}`, SUITS[i % SUITS.length]))

const withCard = (card: unknown) => [card, ...deckOf(CARDS_PER_RUN)]

describe('deckSchema', () => {
  it('accepts a well-formed deck', () => {
    expect(deckSchema.safeParse(deckOf(CARDS_PER_RUN)).success).toBe(true)
  })

  it('rejects a deck too small for one run', () => {
    expect(deckSchema.safeParse(deckOf(CARDS_PER_RUN - 1)).success).toBe(false)
  })

  it('rejects a deck missing cards from a suit', () => {
    const noSpades = deckOf(CARDS_PER_RUN * 2).map((card) =>
      card.suit === 'spades' ? { ...card, suit: 'hearts' } : card,
    )

    const result = deckSchema.safeParse(noSpades)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('spades')
  })

  it('rejects duplicate card ids', () => {
    const cards = deckOf(CARDS_PER_RUN)
    cards[1] = makeCard('card-0', 'diamonds')

    const result = deckSchema.safeParse(cards)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('duplicate card id "card-0"')
  })

  it.each([
    ['a score above +1', { chaos: 2 }],
    ['a fractional score', { good: 0.5 }],
    ['blank text', { text: '   ' }],
    ['an unknown id', { id: 'd' }],
  ])('rejects an answer with %s', (_, override) => {
    const card = makeCard('bad')
    const [a, b, c] = card.options

    expect(
      deckSchema.safeParse(withCard({ ...card, options: [{ ...a, ...override }, b, c] })).success,
    ).toBe(false)
  })

  it('rejects cards without exactly three answers', () => {
    const card = makeCard('bad')
    const [a, b] = card.options

    expect(deckSchema.safeParse(withCard({ ...card, options: [a, b] })).success).toBe(false)
  })

  it('rejects repeated answer ids', () => {
    const card = makeCard('bad')
    const [a, b, c] = card.options

    expect(
      deckSchema.safeParse(withCard({ ...card, options: [a, b, { ...c, id: 'a' }] })).success,
    ).toBe(false)
  })

  it.each(['chaos', 'good'] as const)(
    'rejects a card whose %s scores are not -1, 0 and +1 once each',
    (axis) => {
      const card = makeCard('lopsided')
      const [a, b, c] = card.options
      const lopsided = { ...card, options: [a, { ...b, [axis]: 1 }, c] }

      const result = deckSchema.safeParse(withCard(lopsided))

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toContain(`${axis} scores must be -1, 0 and +1`)
    },
  )

  it('rejects a card without four CHAOS answers', () => {
    const card = makeCard('bad')
    const [w, x, y] = card.chaosOptions

    expect(deckSchema.safeParse(withCard({ ...card, chaosOptions: [w, x, y] })).success).toBe(false)
  })

  it('rejects a neutral score on a CHAOS answer', () => {
    const card = makeCard('bad')
    const [w, x, y, z] = card.chaosOptions

    expect(
      deckSchema.safeParse(withCard({ ...card, chaosOptions: [{ ...w, good: 0 }, x, y, z] }))
        .success,
    ).toBe(false)
  })

  it('rejects CHAOS answers that repeat a corner', () => {
    const card = makeCard('bad')
    const [w, x, y, z] = card.chaosOptions
    const repeated = { ...card, chaosOptions: [w, x, y, { ...z, chaos: -1, good: 1 }] }

    const result = deckSchema.safeParse(withCard(repeated))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('all four corners')
  })

  it('rejects an unknown suit', () => {
    expect(deckSchema.safeParse(withCard({ ...makeCard('bad'), suit: 'cups' })).success).toBe(false)
  })

  it('rejects ids that are not kebab-case slugs', () => {
    expect(deckSchema.safeParse(withCard(makeCard('Not A Slug'))).success).toBe(false)
  })
})

/** How a card pairs its scores: the good score of the lawful, neutral and chaotic answers. */
const pairingOf = (card: Card) =>
  [-1, 0, 1].map((chaos) => card.options.find((o) => o.chaos === chaos)?.good).join()

/*
 * Content rules for the shipped deck. These are about variety and balance rather than
 * shape, so they live here instead of in the schema.
 */
describe('bundled deck', () => {
  it('passes the schema', () => {
    expect(deck).toHaveLength(rawCards.length)
  })

  it.each(SUITS)('has six %s cards', (suit) => {
    expect(deck.filter((card) => card.suit === suit)).toHaveLength(6)
  })

  it.each(SUITS)('uses all six score pairings within %s', (suit) => {
    const pairings = new Set(deck.filter((card) => card.suit === suit).map(pairingOf))

    // Six ways to pair -1/0/+1 chaos with -1/0/+1 good; each suit should use them all
    // so no pattern (e.g. "the chaotic answer is always the kind one") can be learned.
    expect(pairings.size).toBe(6)
  })

  it('can deal a full run with every suit represented', () => {
    expect(deck.length).toBeGreaterThanOrEqual(CARDS_PER_RUN)
    SUITS.forEach((suit) =>
      expect(deck.filter((card) => card.suit === suit).length).toBeGreaterThanOrEqual(MIN_PER_SUIT),
    )
  })
})
