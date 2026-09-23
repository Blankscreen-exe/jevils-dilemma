import { describe, expect, it } from 'vitest'
import { deal } from './deal'

const items = ['a', 'b', 'c', 'd', 'e']

describe('deal', () => {
  it('returns the requested number of distinct items from the pool', () => {
    const hand = deal(items, 3)

    expect(hand).toHaveLength(3)
    expect(new Set(hand).size).toBe(3)
    hand.forEach((item) => expect(items).toContain(item))
  })

  it('is deterministic for a given random source', () => {
    const fixed = () => 0

    expect(deal(items, 5, fixed)).toEqual(deal(items, 5, fixed))
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
