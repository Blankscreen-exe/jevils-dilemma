import { describe, expect, it } from 'vitest'
import { QUICK_MS, REACTION_LINES, SLOW_MS, alignmentCopy, paceOf, reactionLine } from './copy'

describe('alignmentCopy', () => {
  it('has a title for every cell of the chart', () => {
    for (const moral of ['good', 'neutral', 'evil'] as const) {
      for (const ethic of ['lawful', 'neutral', 'chaotic'] as const) {
        expect(alignmentCopy(moral, ethic).title).not.toBe('')
      }
    }
  })
})

describe('paceOf', () => {
  it.each([
    [0, 'quick'],
    [QUICK_MS - 1, 'quick'],
    [QUICK_MS, 'steady'],
    [SLOW_MS, 'steady'],
    [SLOW_MS + 1, 'slow'],
  ] as const)('reads %i ms as %s', (ms, pace) => {
    expect(paceOf(ms)).toBe(pace)
  })
})

describe('reactionLine', () => {
  it('picks a line for the pace', () => {
    expect(REACTION_LINES.slow).toContain(reactionLine('slow'))
  })

  it('uses the random source to choose', () => {
    expect(reactionLine('steady', () => 0)).toBe(REACTION_LINES.steady[0])
    expect(reactionLine('steady', () => 0.999)).toBe(REACTION_LINES.steady.at(-1))
  })
})
