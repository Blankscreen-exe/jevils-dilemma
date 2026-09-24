import { CARDS_PER_RUN, MIN_PER_SUIT, SUITS, type Card } from './deck'

type Random = () => number

/** Returns a shuffled copy (Fisher–Yates). `random` is injectable for deterministic tests. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j] as T, pool[i] as T]
  }
  return pool
}

/** Returns `count` items drawn without repetition, in random order. */
export function deal<T>(items: readonly T[], count: number, random: Random = Math.random): T[] {
  if (count > items.length) {
    throw new RangeError(`Cannot deal ${count} items from ${items.length}`)
  }
  return shuffle(items, random).slice(0, count)
}

/**
 * Deals a run: at least MIN_PER_SUIT cards from every suit, the rest from anywhere, in
 * random order. Every answer list is shuffled too, so position never hints at a score.
 * The last card becomes the CHAOS card (see `isChaosCard`).
 */
export function dealRun(
  deck: readonly Card[],
  random: Random = Math.random,
  count: number = CARDS_PER_RUN,
): Card[] {
  const guaranteed = SUITS.flatMap((suit) =>
    deal(
      deck.filter((card) => card.suit === suit),
      MIN_PER_SUIT,
      random,
    ),
  )
  const rest = deck.filter((card) => !guaranteed.includes(card))
  const hand = [...guaranteed, ...deal(rest, count - guaranteed.length, random)]

  return shuffle(hand, random).map((card) => ({
    ...card,
    options: shuffle(card.options, random) as Card['options'],
    chaosOptions: shuffle(card.chaosOptions, random) as Card['chaosOptions'],
  }))
}

/** The answers rearranged to match `order` (a list of ids), or null if they don't match. */
function permute<T extends { id: string }>(answers: readonly T[], order: readonly string[]) {
  if (order.length !== answers.length || new Set(order).size !== order.length) return null
  const result = order.map((id) => answers.find((answer) => answer.id === id))
  return result.every((answer): answer is T => answer !== undefined) ? result : null
}

/**
 * Restores a saved answer order. `order` holds the ids of the answers that were on screen:
 * either the three normal answers or the four CHAOS answers. Null if it matches neither.
 */
export function reorderAnswers(card: Card, order: readonly string[]): Card | null {
  const options = permute(card.options, order)
  if (options) return { ...card, options: options as Card['options'] }
  const chaosOptions = permute(card.chaosOptions, order)
  if (chaosOptions) return { ...card, chaosOptions: chaosOptions as Card['chaosOptions'] }
  return null
}
