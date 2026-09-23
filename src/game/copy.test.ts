import { describe, expect, it } from 'vitest'
import { REACTION_LINES, alignmentCopy, reactionLine } from './copy'

describe('alignmentCopy', () => {
  it('has a title for every cell of the chart', () => {
    for (const moral of ['good', 'neutral', 'evil'] as const) {
      for (const ethic of ['lawful', 'neutral', 'chaotic'] as const) {
        expect(alignmentCopy(moral, ethic).title).not.toBe('')
      }
    }
  })
})

describe('reactionLine', () => {
  it('picks a line for the reaction', () => {
    expect(REACTION_LINES.chaotic).toContain(reactionLine('chaotic'))
  })

  it('uses the random source to choose', () => {
    expect(reactionLine('lawful', () => 0)).toBe(REACTION_LINES.lawful[0])
    expect(reactionLine('lawful', () => 0.999)).toBe(REACTION_LINES.lawful.at(-1))
  })
})
