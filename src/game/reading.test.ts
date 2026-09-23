import { describe, expect, it } from 'vitest'
import { makeCard } from '../test/fixtures'
import type { Alignment } from './alignment'
import { ALIGNMENT_COPY, STEADY_SUIT_LINE } from './copy'
import type { OptionId, Suit } from './deck'
import { readingOf, suitLineOf } from './reading'
import type { Answer } from './state'
import { summarize } from './summary'

const at = (chaos: number, good: number): Alignment => ({
  chaos,
  good,
  ethic: 'neutral',
  moral: 'neutral',
})

const bySuit = (entries: Partial<Record<Suit, Alignment>>): Record<Suit, Alignment | null> => ({
  hearts: null,
  diamonds: null,
  clubs: null,
  spades: null,
  ...entries,
})

describe('suitLineOf', () => {
  it('names the suit with the strongest lean, and which way', () => {
    const line = suitLineOf(bySuit({ hearts: at(0.5, 0.5), diamonds: at(0, -1) }))

    expect(line).toEqual({ suit: 'diamonds', text: '♦ Most ruthless with money.' })
  })

  it.each([
    [at(1, 0), '♥ Wildest in love and friendship.'],
    [at(-1, 0), '♥ Strictest in love and friendship.'],
    [at(0, 1), '♥ Kindest in love and friendship.'],
  ])('describes %o', (alignment, text) => {
    expect(suitLineOf(bySuit({ hearts: alignment })).text).toBe(text)
  })

  it('calls the player steady when no suit leaves the neutral band', () => {
    expect(suitLineOf(bySuit({ hearts: at(0.3, -0.3), clubs: at(0, 0) }))).toEqual({
      suit: null,
      text: STEADY_SUIT_LINE,
    })
  })
})

describe('readingOf', () => {
  // Option a is Lawful Evil, b True Neutral, c Chaotic Good (see makeCard).
  const cards = Array.from({ length: 10 }, (_, i) => makeCard(`card-${i}`, 'spades'))
  const run = (optionId: OptionId, ids = cards.map((c) => c.id)): Answer[] =>
    ids.map((cardId) => ({ cardId, optionId, elapsedMs: 1000, reason: '' }))

  it('gives an all-in run the pure title for its cell', () => {
    const reading = readingOf(summarize(cards, run('a')))

    expect(reading).toMatchObject({
      label: 'Lawful Evil',
      tier: 'pure',
      title: ALIGNMENT_COPY['evil-lawful'].titles.pure,
    })
    expect(ALIGNMENT_COPY['evil-lawful'].verdicts).toContain(reading.verdict)
    expect(reading.suitLine.text).toBe('♠ Strictest when danger calls.')
  })

  it('always gives the same run the same verdict', () => {
    const answers = run('c')

    expect(readingOf(summarize(cards, answers)).verdict).toBe(
      readingOf(summarize(cards, answers)).verdict,
    )
  })

  it('varies the verdict between different runs in the same cell', () => {
    // Twelve different all-Chaotic-Good runs: same cell, different cards.
    const verdicts = new Set(
      Array.from({ length: 12 }, (_, n) => {
        const runCards = Array.from({ length: 10 }, (__, i) => makeCard(`run-${n}-${i}`))
        return readingOf(
          summarize(
            runCards,
            run(
              'c',
              runCards.map((c) => c.id),
            ),
          ),
        ).verdict
      }),
    )

    expect(verdicts.size).toBeGreaterThan(1)
  })
})
