import { tierOf, type Alignment, type Tier } from './alignment'
import {
  CHAOS_HELD_LINE,
  LEANING_WORDS,
  STEADY_SUIT_LINE,
  SUIT_CONTEXT,
  alignmentCopy,
  chaosDraggedLine,
} from './copy'
import { SUITS, type Suit } from './deck'
import type { RunSummary } from './summary'

/** Beyond this (the edge of the neutral band) a suit counts as leaning somewhere. */
const LEANING_THRESHOLD = 1 / 3

export interface SuitLine {
  suit: Suit | null
  text: string
}

export interface Reading {
  /** Plain alignment name, e.g. "Chaotic Good". */
  label: string
  tier: Tier
  title: string
  verdict: string
  suitLine: SuitLine
  /** What the CHAOS card did to the result; null when there was no CHAOS pick. */
  chaosLine: string | null
}

/** Small stable string hash (djb2), so the same run always gets the same verdict line. */
function hash(text: string): number {
  let value = 5381
  for (let i = 0; i < text.length; i++) value = (value * 33) ^ text.charCodeAt(i)
  return value >>> 0
}

/**
 * Names the suit where the player leaned hardest, and which way.
 * e.g. { suit: 'diamonds', text: 'Most ruthless with money.' } (the suit icon is drawn by the UI)
 */
export function suitLineOf(bySuit: Record<Suit, Alignment | null>): SuitLine {
  let strongest: { suit: Suit; axis: 'chaos' | 'good'; value: number } | null = null

  for (const suit of SUITS) {
    const alignment = bySuit[suit]
    if (!alignment) continue
    for (const axis of ['chaos', 'good'] as const) {
      const value = alignment[axis]
      if (Math.abs(value) > Math.abs(strongest?.value ?? 0)) strongest = { suit, axis, value }
    }
  }

  if (!strongest || Math.abs(strongest.value) <= LEANING_THRESHOLD) {
    return { suit: null, text: STEADY_SUIT_LINE }
  }

  const { suit, axis, value } = strongest
  const leaning =
    axis === 'chaos' ? (value > 0 ? 'chaotic' : 'lawful') : value > 0 ? 'good' : 'evil'
  return {
    suit,
    text: `${LEANING_WORDS[leaning]} ${SUIT_CONTEXT[suit]}.`,
  }
}

/** Whether the CHAOS pick moved the result into a different cell of the chart. */
function chaosLineOf({ chaosPick, alignment, alignmentBeforeChaos }: RunSummary): string | null {
  if (!chaosPick) return null
  const moved =
    alignment.ethic !== alignmentBeforeChaos.ethic || alignment.moral !== alignmentBeforeChaos.moral
  return moved
    ? chaosDraggedLine(alignmentCopy(alignment.moral, alignment.ethic).label)
    : CHAOS_HELD_LINE
}

/** Everything Jevil says about a finished run. */
export function readingOf(summary: RunSummary): Reading {
  const { alignment } = summary
  const copy = alignmentCopy(alignment.moral, alignment.ethic)
  const tier = tierOf(alignment)
  const runKey = summary.picks.map(({ answer }) => `${answer.cardId}:${answer.optionId}`).join()

  return {
    label: copy.label,
    tier,
    title: copy.titles[tier],
    verdict: copy.verdicts[hash(runKey) % copy.verdicts.length] ?? copy.verdicts[0] ?? '',
    suitLine: suitLineOf(summary.bySuit),
    chaosLine: chaosLineOf(summary),
  }
}
