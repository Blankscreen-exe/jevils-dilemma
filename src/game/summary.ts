import { alignmentOf, type Alignment } from './alignment'
import { CHAOS_WEIGHT, SUITS, isChaosAnswer, type Card, type CardOption, type Suit } from './deck'
import type { Answer } from './state'

export interface ResolvedPick {
  card: Card
  option: CardOption
  answer: Answer
  /** True when this was the drastic answer on the CHAOS card. */
  isChaos: boolean
}

export interface RunSummary {
  picks: ResolvedPick[]
  /** Final alignment, with the CHAOS pick counting CHAOS_WEIGHT times. */
  alignment: Alignment
  /** The CHAOS pick, or null if the run had none (e.g. an unfinished run). */
  chaosPick: ResolvedPick | null
  /** Alignment from the normal picks alone, to show what the CHAOS card changed. */
  alignmentBeforeChaos: Alignment
  /** Alignment within each suit (every pick counted once); null for suits not played. */
  bySuit: Record<Suit, Alignment | null>
  /** The decision that took longest, or null for an empty run. */
  hardest: ResolvedPick | null
  /** The decision that took least time, or null for an empty run. */
  quickest: ResolvedPick | null
}

/** Joins answers back to their cards and derives everything the results screen shows. */
export function summarize(cards: readonly Card[], answers: readonly Answer[]): RunSummary {
  const byId = new Map(cards.map((card) => [card.id, card]))

  const picks = answers.flatMap((answer) => {
    const card = byId.get(answer.cardId)
    const option = [...(card?.options ?? []), ...(card?.chaosOptions ?? [])].find(
      (o) => o.id === answer.optionId,
    )
    return card && option ? [{ card, option, answer, isChaos: isChaosAnswer(option) }] : []
  })

  const normalPicks = picks.filter((pick) => !pick.isChaos)
  const chaosPick = picks.find((pick) => pick.isChaos) ?? null

  const bySuit = Object.fromEntries(
    SUITS.map((suit) => {
      const options = picks.filter((pick) => pick.card.suit === suit).map((pick) => pick.option)
      return [suit, options.length > 0 ? alignmentOf(options) : null]
    }),
  ) as Record<Suit, Alignment | null>

  const byTime = [...picks].sort((x, y) => y.answer.elapsedMs - x.answer.elapsedMs)

  return {
    picks,
    alignment: alignmentOf(
      picks.map(({ option, isChaos }) => ({ ...option, weight: isChaos ? CHAOS_WEIGHT : 1 })),
    ),
    chaosPick,
    alignmentBeforeChaos: alignmentOf(normalPicks.map((pick) => pick.option)),
    bySuit,
    hardest: byTime[0] ?? null,
    quickest: byTime.at(-1) ?? null,
  }
}
