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
 * random order. Each card's answers are shuffled too, so position never hints at a score.
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

  return shuffle(hand, random).map((card) => withOptionOrder(card, shuffle(card.options, random)))
}

/** A copy of the card with its answers in the given order. */
function withOptionOrder(card: Card, options: Card['options'][number][]): Card {
  const [first, second, third] = options
  if (!first || !second || !third) throw new Error(`Card "${card.id}" must have three options`)
  return { ...card, options: [first, second, third] }
}

/** Reorders a card's answers to match saved option ids; null if they don't match the card. */
export function reorderOptions(card: Card, order: readonly string[]): Card | null {
  const options = order.map((id) => card.options.find((option) => option.id === id))
  if (options.length !== card.options.length || options.some((o) => o === undefined)) return null
  if (new Set(order).size !== order.length) return null
  return withOptionOrder(card, options as Card['options'][number][])
}
