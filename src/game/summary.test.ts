import { describe, expect, it } from 'vitest'
import type { Card } from './deck'
import type { Answer } from './state'
import { summarize } from './summary'

const card = (id: string): Card => ({
  id,
  prompt: `${id}?`,
  options: [
    { id: 'a', text: `${id} A`, chaos: -2, good: 2 },
    { id: 'b', text: `${id} B`, chaos: 2, good: -2 },
  ],
})

const cards = [card('one'), card('two'), card('three')]

const answer = (cardId: string, optionId: 'a' | 'b', elapsedMs: number): Answer => ({
  cardId,
  optionId,
  elapsedMs,
  reason: '',
})

describe('summarize', () => {
  const answers = [answer('one', 'b', 4000), answer('two', 'b', 900), answer('three', 'b', 2500)]

  it('resolves each answer to its card and option', () => {
    const { picks } = summarize(cards, answers)

    expect(picks.map((pick) => pick.option.text)).toEqual(['one B', 'two B', 'three B'])
  })

  it('finds the hardest and quickest decisions', () => {
    const { hardest, quickest } = summarize(cards, answers)

    expect(hardest?.card.id).toBe('one')
    expect(quickest?.card.id).toBe('two')
  })

  it('computes the alignment from the chosen options', () => {
    expect(summarize(cards, answers).alignment).toMatchObject({ ethic: 'chaotic', moral: 'evil' })
  })

  it('skips answers whose card is unknown', () => {
    const { picks } = summarize(cards, [answer('missing', 'a', 1), answer('one', 'a', 1)])

    expect(picks.map((pick) => pick.card.id)).toEqual(['one'])
  })

  it('handles an empty run', () => {
    expect(summarize(cards, [])).toMatchObject({ picks: [], hardest: null, quickest: null })
  })
})
