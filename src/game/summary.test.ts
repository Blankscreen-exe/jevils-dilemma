import { describe, expect, it } from 'vitest'
import { makeCard } from '../test/fixtures'
import type { OptionId } from './deck'
import type { Answer } from './state'
import { summarize } from './summary'

// Option a is Lawful Evil, b True Neutral, c Chaotic Good (see makeCard).
const cards = [makeCard('one', 'hearts'), makeCard('two', 'hearts'), makeCard('three', 'spades')]

const answer = (cardId: string, optionId: OptionId, elapsedMs: number): Answer => ({
  cardId,
  optionId,
  elapsedMs,
  reason: '',
})

describe('summarize', () => {
  const answers = [answer('one', 'c', 4000), answer('two', 'c', 900), answer('three', 'a', 2500)]

  it('resolves each answer to its card and option', () => {
    const { picks } = summarize(cards, answers)

    expect(picks.map((pick) => pick.option.text)).toEqual(['one C', 'two C', 'three A'])
  })

  it('finds the hardest and quickest decisions', () => {
    const { hardest, quickest } = summarize(cards, answers)

    expect(hardest?.card.id).toBe('one')
    expect(quickest?.card.id).toBe('two')
  })

  it('computes the overall alignment from the chosen answers', () => {
    // Net +1 on both axes over three picks: 1/3 each, which is still neutral.
    expect(summarize(cards, answers).alignment).toMatchObject({
      ethic: 'neutral',
      moral: 'neutral',
    })
  })

  it('computes an alignment per suit, and null for suits not played', () => {
    const { bySuit } = summarize(cards, answers)

    expect(bySuit.hearts).toMatchObject({ ethic: 'chaotic', moral: 'good' })
    expect(bySuit.spades).toMatchObject({ ethic: 'lawful', moral: 'evil' })
    expect(bySuit.diamonds).toBeNull()
    expect(bySuit.clubs).toBeNull()
  })

  it('skips answers whose card is unknown', () => {
    const { picks } = summarize(cards, [answer('missing', 'a', 1), answer('one', 'a', 1)])

    expect(picks.map((pick) => pick.card.id)).toEqual(['one'])
  })

  it('handles an empty run', () => {
    expect(summarize(cards, [])).toMatchObject({ picks: [], hardest: null, quickest: null })
  })
})
