import { describe, expect, it } from 'vitest'
import { alignmentOf, reactionTo } from './alignment'
import type { CardOption } from './deck'

const pick = (chaos: number, good: number): CardOption => ({ id: 'a', text: 'x', chaos, good })
const repeat = (option: CardOption, times: number) => Array.from({ length: times }, () => option)

describe('alignmentOf', () => {
  it.each([
    [pick(-2, 2), 'lawful', 'good'],
    [pick(0, 2), 'neutral', 'good'],
    [pick(2, 2), 'chaotic', 'good'],
    [pick(-2, 0), 'lawful', 'neutral'],
    [pick(0, 0), 'neutral', 'neutral'],
    [pick(2, 0), 'chaotic', 'neutral'],
    [pick(-2, -2), 'lawful', 'evil'],
    [pick(0, -2), 'neutral', 'evil'],
    [pick(2, -2), 'chaotic', 'evil'],
  ] as const)('places consistent %o picks in %s %s', (option, ethic, moral) => {
    expect(alignmentOf(repeat(option, 10))).toMatchObject({ ethic, moral })
  })

  it('normalises each axis to -1..1', () => {
    expect(alignmentOf(repeat(pick(2, -2), 4))).toMatchObject({ chaos: 1, good: -1 })
    expect(alignmentOf([pick(2, 0), pick(-2, 0)])).toMatchObject({ chaos: 0 })
  })

  it('keeps values on the band edge neutral', () => {
    // One maximum-chaos pick out of three averages to exactly 1/3.
    const picks = [pick(2, 0), pick(0, 0), pick(0, 0)]

    expect(alignmentOf(picks).chaos).toBeCloseTo(1 / 3)
    expect(alignmentOf(picks).ethic).toBe('neutral')
  })

  it('treats an empty run as true neutral', () => {
    expect(alignmentOf([])).toEqual({ ethic: 'neutral', moral: 'neutral', chaos: 0, good: 0 })
  })
})

describe('reactionTo', () => {
  it.each([
    [{ chaos: 0, good: 0 }, 'neutral'],
    [{ chaos: 2, good: 0 }, 'chaotic'],
    [{ chaos: -1, good: 0 }, 'lawful'],
    [{ chaos: 1, good: 2 }, 'good'],
    [{ chaos: -1, good: -2 }, 'evil'],
    [{ chaos: 2, good: -2 }, 'chaotic'],
  ] as const)('reacts to %o with %s', (option, expected) => {
    expect(reactionTo(option)).toBe(expected)
  })
})
