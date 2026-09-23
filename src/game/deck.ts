import * as z from 'zod/mini'
import rawCards from '../data/cards.json'

/** Cards dealt in a single run. The last one is the CHAOS card. */
export const CARDS_PER_RUN = 10

/** Every run includes at least this many cards from each suit. */
export const MIN_PER_SUIT = 2

/** Scores run from -1 to +1 on each axis, so each answer maps to one alignment cell. */
export const SCORE_LIMIT = 1

/** How many normal picks the CHAOS card's answer counts as. */
export const CHAOS_WEIGHT = 3

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export type Suit = (typeof SUITS)[number]

/** Ids of the three normal answers. */
export const OPTION_IDS = ['a', 'b', 'c'] as const
/** Ids of the four drastic answers shown only on the CHAOS card. */
export const CHAOS_OPTION_IDS = ['w', 'x', 'y', 'z'] as const
export const ALL_OPTION_IDS = [...OPTION_IDS, ...CHAOS_OPTION_IDS] as const

const scoreSchema = z.int().check(z.minimum(-SCORE_LIMIT), z.maximum(SCORE_LIMIT))
/** Drastic answers sit in a corner of the chart: never neutral on either axis. */
const extremeScoreSchema = z.union([z.literal(-SCORE_LIMIT), z.literal(SCORE_LIMIT)])

/** Non-blank text, with surrounding whitespace trimmed. */
const textSchema = z.string().check(z.trim(), z.minLength(1))

const optionSchema = z.object({
  id: z.enum(OPTION_IDS),
  text: textSchema,
  /** -1 lawful, 0 neutral, +1 chaotic */
  chaos: scoreSchema,
  /** -1 evil, 0 neutral, +1 good */
  good: scoreSchema,
})

const chaosOptionSchema = z.object({
  id: z.enum(CHAOS_OPTION_IDS),
  text: textSchema,
  chaos: extremeScoreSchema,
  good: extremeScoreSchema,
})

/** True when the values are exactly -1, 0 and +1 in some order. */
const isFullSpread = (values: readonly number[]) =>
  [...values].sort((x, y) => x - y).join() === '-1,0,1'

const hasUniqueIds = (answers: readonly { id: string }[]) =>
  new Set(answers.map((answer) => answer.id)).size === answers.length

export const cardSchema = z.object({
  /** Stable kebab-case slug; saved history refers to cards by this id. */
  id: z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be a kebab-case slug')),
  suit: z.enum(SUITS),
  prompt: textSchema,
  options: z.tuple([optionSchema, optionSchema, optionSchema]).check(
    z.superRefine((options, ctx) => {
      if (!hasUniqueIds(options)) {
        ctx.addIssue({ code: 'custom', message: 'option ids must be unique' })
      }
      // The core balance rule: no answer is simply "the chaotic one" or "the good one".
      for (const axis of ['chaos', 'good'] as const) {
        if (!isFullSpread(options.map((o) => o[axis]))) {
          ctx.addIssue({
            code: 'custom',
            message: `${axis} scores must be -1, 0 and +1, once each`,
          })
        }
      }
    }),
  ),
  /** Drastic answers for when this card is dealt as the CHAOS card: one per corner. */
  chaosOptions: z
    .tuple([chaosOptionSchema, chaosOptionSchema, chaosOptionSchema, chaosOptionSchema])
    .check(
      z.superRefine((options, ctx) => {
        if (!hasUniqueIds(options)) {
          ctx.addIssue({ code: 'custom', message: 'CHAOS option ids must be unique' })
        }
        const corners = new Set(options.map((o) => `${o.chaos},${o.good}`))
        if (corners.size !== 4) {
          ctx.addIssue({
            code: 'custom',
            message: 'CHAOS options must cover all four corners, once each',
          })
        }
      }),
    ),
})

export const deckSchema = z.array(cardSchema).check(
  z.minLength(CARDS_PER_RUN, `deck needs at least ${CARDS_PER_RUN} cards for one run`),
  z.superRefine((cards, ctx) => {
    const seen = new Set<string>()
    cards.forEach((card, index) => {
      if (seen.has(card.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate card id "${card.id}"`,
          path: [index, 'id'],
        })
      }
      seen.add(card.id)
    })
    for (const suit of SUITS) {
      const count = cards.filter((card) => card.suit === suit).length
      if (count < MIN_PER_SUIT) {
        ctx.addIssue({
          code: 'custom',
          message: `deck needs at least ${MIN_PER_SUIT} ${suit} cards, found ${count}`,
        })
      }
    }
  }),
)

export type Card = z.infer<typeof cardSchema>
export type CardOption = Card['options'][number] | Card['chaosOptions'][number]
export type OptionId = CardOption['id']

/** The last card of a run is the CHAOS card. */
export function isChaosCard(index: number, runLength: number): boolean {
  return index === runLength - 1
}

/** The answers shown for a card: the drastic four on the CHAOS card, else the normal three. */
export function answersFor(card: Card, chaos: boolean): readonly CardOption[] {
  return chaos ? card.chaosOptions : card.options
}

/** Whether an answer is one of a card's drastic CHAOS answers. */
export function isChaosAnswer(option: Pick<CardOption, 'id'>): boolean {
  return (CHAOS_OPTION_IDS as readonly string[]).includes(option.id)
}

/** The bundled deck, validated once at startup so a bad card fails loudly. */
export const deck: readonly Card[] = deckSchema.parse(rawCards)
