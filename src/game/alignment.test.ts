import { describe, expect, it } from 'vitest'
import { alignmentOf } from './alignment'
import type { CardOption } from './deck'

const pick = (chaos: number, good: number): CardOption => ({ id: 'a', text: 'x', chaos, good })
const repeat = (option: CardOption, times: number) => Array.from({ length: times }, () => option)

describe('alignmentOf', () => {
  it.each([
    [pick(-1, 1), 'lawful', 'good'],
    [pick(0, 1), 'neutral', 'good'],
    [pick(1, 1), 'chaotic', 'good'],
    [pick(-1, 0), 'lawful', 'neutral'],
    [pick(0, 0), 'neutral', 'neutral'],
    [pick(1, 0), 'chaotic', 'neutral'],
    [pick(-1, -1), 'lawful', 'evil'],
    [pick(0, -1), 'neutral', 'evil'],
    [pick(1, -1), 'chaotic', 'evil'],
  ] as const)('places consistent %o picks in %s %s', (option, ethic, moral) => {
    expect(alignmentOf(repeat(option, 10))).toMatchObject({ ethic, moral })
  })

  it('normalises each axis to -1..1', () => {
    expect(alignmentOf(repeat(pick(1, -1), 4))).toMatchObject({ chaos: 1, good: -1 })
    expect(alignmentOf([pick(1, 0), pick(-1, 0)])).toMatchObject({ chaos: 0 })
  })

  // Over a 10-card run, a net lean of 4 in one direction is needed to leave neutral.
  it.each([
    [3, 'neutral'],
    [4, 'chaotic'],
    [-3, 'neutral'],
    [-4, 'lawful'],
  ] as const)('reads a net lean of %i over 10 cards as %s', (net, ethic) => {
    const leaning = repeat(pick(Math.sign(net), 0), Math.abs(net))
    const neutral = repeat(pick(0, 0), 10 - Math.abs(net))

    expect(alignmentOf([...leaning, ...neutral]).ethic).toBe(ethic)
  })

  it('treats an empty run as true neutral', () => {
    expect(alignmentOf([])).toEqual({ ethic: 'neutral', moral: 'neutral', chaos: 0, good: 0 })
  })
})
