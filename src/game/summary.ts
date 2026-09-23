import { alignmentOf, type Alignment } from './alignment'
import type { Card, CardOption } from './deck'
import type { Answer } from './state'

export interface ResolvedPick {
  card: Card
  option: CardOption
  answer: Answer
}

export interface RunSummary {
  picks: ResolvedPick[]
  alignment: Alignment
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
    const option = card?.options.find((o) => o.id === answer.optionId)
    return card && option ? [{ card, option, answer }] : []
  })

  const byTime = [...picks].sort((x, y) => y.answer.elapsedMs - x.answer.elapsedMs)

  return {
    picks,
    alignment: alignmentOf(picks.map((pick) => pick.option)),
    hardest: byTime[0] ?? null,
    quickest: byTime.at(-1) ?? null,
  }
}
