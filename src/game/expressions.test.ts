import { describe, expect, it } from 'vitest'
import type { Alignment, EthicAxis, MoralAxis } from './alignment'
import {
  CHAOS_EXPRESSION,
  EXPRESSIONS,
  IDLE_EXPRESSION,
  TITLE_EXPRESSION,
  expressionForAlignment,
  expressionForPace,
} from './expressions'

const at = (moral: MoralAxis, ethic: EthicAxis): Alignment => ({ moral, ethic, chaos: 0, good: 0 })

describe('expressions', () => {
  it.each([
    ['quick', 'excited'],
    ['steady', 'smirk'],
    ['slow', 'flabbergasted'],
  ] as const)('reacts to a %s pick with %s', (pace, expression) => {
    expect(expressionForPace(pace)).toBe(expression)
  })

  it.each([
    ['evil', 'lawful', 'evil-smile'],
    ['evil', 'chaotic', 'evil-smile'],
    ['good', 'chaotic', 'cheerful'],
    ['good', 'lawful', 'disappointed'],
    ['neutral', 'chaotic', 'excited'],
    ['neutral', 'lawful', 'disappointed'],
    ['neutral', 'neutral', 'astonished'],
  ] as const)('reads %s %s with %s', (moral, ethic, expression) => {
    expect(expressionForAlignment(at(moral, ethic))).toBe(expression)
  })

  it('uses every expression somewhere', () => {
    const cells = (['good', 'neutral', 'evil'] as const).flatMap((moral) =>
      (['lawful', 'neutral', 'chaotic'] as const).map((ethic) => at(moral, ethic)),
    )
    const used = new Set([
      IDLE_EXPRESSION,
      TITLE_EXPRESSION,
      CHAOS_EXPRESSION,
      ...(['quick', 'steady', 'slow'] as const).map(expressionForPace),
      ...cells.map(expressionForAlignment),
    ])

    expect([...used].sort()).toEqual([...EXPRESSIONS].sort())
  })
})
