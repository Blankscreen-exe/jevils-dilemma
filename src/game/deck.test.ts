import { describe, expect, it } from 'vitest'
import rawCards from '../data/cards.json'
import { CARDS_PER_RUN, deck, deckSchema, type Card } from './deck'

const validCard: Card = {
  id: 'sample-card',
  prompt: 'A sample dilemma?',
  options: [
    { id: 'a', text: 'Lawful choice', chaos: -1, good: 1 },
    { id: 'b', text: 'Chaotic choice', chaos: 2, good: -1 },
  ],
}

const deckOf = (count: number): Card[] =>
  Array.from({ length: count }, (_, i) => ({ ...validCard, id: `card-${i}` }))

describe('deckSchema', () => {
  it('accepts a well-formed deck', () => {
    expect(deckSchema.safeParse(deckOf(CARDS_PER_RUN)).success).toBe(true)
  })

  it('rejects a deck too small for one run', () => {
    expect(deckSchema.safeParse(deckOf(CARDS_PER_RUN - 1)).success).toBe(false)
  })

  it('rejects duplicate card ids', () => {
    const cards = deckOf(CARDS_PER_RUN)
    cards[1] = { ...validCard, id: 'card-0' }

    const result = deckSchema.safeParse(cards)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('duplicate card id "card-0"')
  })

  it.each([
    ['score above the limit', { chaos: 3 }],
    ['score below the limit', { good: -3 }],
    ['fractional score', { chaos: 1.5 }],
    ['blank text', { text: '   ' }],
  ])('rejects an option with a %s', (_, override) => {
    const [a, b] = validCard.options
    const card = { ...validCard, options: [{ ...a, ...override }, b] }

    expect(deckSchema.safeParse([card, ...deckOf(CARDS_PER_RUN)]).success).toBe(false)
  })

  it('rejects options that are not exactly a then b', () => {
    const [a, b] = validCard.options
    const swapped = { ...validCard, options: [b, a] }
    const tooMany = { ...validCard, options: [a, b, { ...b, id: 'c' }] }

    expect(deckSchema.safeParse([swapped, ...deckOf(CARDS_PER_RUN)]).success).toBe(false)
    expect(deckSchema.safeParse([tooMany, ...deckOf(CARDS_PER_RUN)]).success).toBe(false)
  })

  it('rejects ids that are not kebab-case slugs', () => {
    const card = { ...validCard, id: 'Not A Slug' }

    expect(deckSchema.safeParse([card, ...deckOf(CARDS_PER_RUN)]).success).toBe(false)
  })
})

/*
 * Content rules for the shipped deck. These are about game balance rather than shape,
 * so they live here instead of in the schema.
 */
describe('bundled deck', () => {
  it('passes the schema', () => {
    expect(deck).toHaveLength(rawCards.length)
  })

  it('gives every card two options that differ on at least one axis', () => {
    const flat = deck.filter(({ options: [a, b] }) => a.chaos === b.chaos && a.good === b.good)

    expect(flat.map((card) => card.id)).toEqual([])
  })

  it('gives enough cards a moral edge for the good/evil axis to matter', () => {
    const moral = deck.filter((card) => card.options.some((option) => option.good !== 0))

    // At least half the deck must be able to move the good/evil axis.
    expect(moral.length / deck.length).toBeGreaterThanOrEqual(0.5)
  })

  it('offers both a lawful and a chaotic pick across the deck', () => {
    const options = deck.flatMap((card) => card.options)

    expect(options.some((option) => option.chaos < 0)).toBe(true)
    expect(options.some((option) => option.chaos > 0)).toBe(true)
  })
})
