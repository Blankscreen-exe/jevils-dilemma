import { describe, expect, it } from 'vitest'
import { QUICK_MS, REACTION_LINES, SLOW_MS, alignmentCopy, paceOf, reactionLine } from './copy'

describe('alignmentCopy', () => {
  const cells = (['good', 'neutral', 'evil'] as const).flatMap((moral) =>
    (['lawful', 'neutral', 'chaotic'] as const).map((ethic) => alignmentCopy(moral, ethic)),
  )

  it('has three tiered titles and at least three verdicts for every cell', () => {
    for (const cell of cells) {
      expect(Object.values(cell.titles).every((title) => title.length > 0)).toBe(true)
      expect(cell.verdicts.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('never reuses a title or verdict across cells', () => {
    const titles = cells.flatMap((cell) => Object.values(cell.titles))
    const verdicts = cells.flatMap((cell) => cell.verdicts)

    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(verdicts).size).toBe(verdicts.length)
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
