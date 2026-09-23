import { describe, expect, it } from 'vitest'
import { makeCard } from '../test/fixtures'
import { deal, dealRun, reorderAnswers, shuffle } from './deal'
import { CARDS_PER_RUN, MIN_PER_SUIT, SUITS } from './deck'

const items = ['a', 'b', 'c', 'd', 'e']

/** Deterministic pseudo-random source (mulberry32) so shuffles vary but tests repeat. */
function seeded(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const deck = SUITS.flatMap((suit) =>
  Array.from({ length: 6 }, (_, i) => makeCard(`${suit}-${i}`, suit)),
)

describe('shuffle / deal', () => {
  it('shuffles without losing or duplicating items', () => {
    expect([...shuffle(items, seeded(1))].sort()).toEqual(items)
  })

  it('deals the requested number of distinct items', () => {
    const hand = deal(items, 3, seeded(2))

    expect(hand).toHaveLength(3)
    expect(new Set(hand).size).toBe(3)
  })

  it('is deterministic for a given random source', () => {
    expect(deal(items, 5, seeded(3))).toEqual(deal(items, 5, seeded(3)))
  })

  it('does not mutate the input', () => {
    const copy = [...items]
    deal(items, 5)
    expect(items).toEqual(copy)
  })

  it('throws when asked for more items than exist', () => {
    expect(() => deal(items, 6)).toThrow(RangeError)
  })
})

describe('dealRun', () => {
  it.each([1, 2, 3, 4, 5])('deals a full run of distinct cards (seed %i)', (seed) => {
    const run = dealRun(deck, seeded(seed))

    expect(run).toHaveLength(CARDS_PER_RUN)
    expect(new Set(run.map((card) => card.id)).size).toBe(CARDS_PER_RUN)
  })

  it.each([1, 2, 3, 4, 5])('includes every suit at least twice (seed %i)', (seed) => {
    const run = dealRun(deck, seeded(seed))

    SUITS.forEach((suit) =>
      expect(run.filter((card) => card.suit === suit).length).toBeGreaterThanOrEqual(MIN_PER_SUIT),
    )
  })

  it('shuffles the CHAOS answers too', () => {
    const firstChaos = new Set(
      Array.from(
        { length: 20 },
        (_, seed) => dealRun(deck, seeded(seed)).at(-1)?.chaosOptions[0]?.id,
      ),
    )

    expect(firstChaos).toEqual(new Set(['w', 'x', 'y', 'z']))
  })

  it('shuffles the answers so position does not give scores away', () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        dealRun(deck, seeded(seed))
          .flatMap((card) => card.options.map((o) => o.id))
          .join(''),
      ),
    )
    const firstPositions = new Set(
      Array.from({ length: 20 }, (_, seed) => dealRun(deck, seeded(seed))[0]?.options[0]?.id),
    )

    expect(orders.size).toBeGreaterThan(1)
    expect(firstPositions).toEqual(new Set(['a', 'b', 'c']))
  })
})

describe('reorderAnswers', () => {
  const card = makeCard('one')

  it('puts the normal answers in the given order', () => {
    expect(reorderAnswers(card, ['c', 'a', 'b'])?.options.map((o) => o.id)).toEqual(['c', 'a', 'b'])
  })

  it('puts the CHAOS answers in the given order', () => {
    const reordered = reorderAnswers(card, ['z', 'x', 'w', 'y'])

    expect(reordered?.chaosOptions.map((o) => o.id)).toEqual(['z', 'x', 'w', 'y'])
    expect(reordered?.options).toEqual(card.options)
  })

  it.each([
    ['too few ids', ['a', 'b']],
    ['a repeated id', ['a', 'a', 'b']],
    ['an unknown id', ['a', 'b', 'x']],
    ['a mix of normal and CHAOS ids', ['a', 'b', 'c', 'w']],
  ])('returns null for %s', (_, order) => {
    expect(reorderAnswers(card, order)).toBeNull()
  })
})
