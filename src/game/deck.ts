import * as z from 'zod/mini'
import rawCards from '../data/cards.json'

/** Cards dealt in a single run. */
export const CARDS_PER_RUN = 10

/** Every run includes at least this many cards from each suit. */
export const MIN_PER_SUIT = 2

/** Scores run from -1 to +1 on each axis, so each answer maps to one alignment cell. */
export const SCORE_LIMIT = 1

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export type Suit = (typeof SUITS)[number]

export const OPTION_IDS = ['a', 'b', 'c'] as const

const scoreSchema = z.int().check(z.minimum(-SCORE_LIMIT), z.maximum(SCORE_LIMIT))

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

/** True when the values are exactly -1, 0 and +1 in some order. */
const isFullSpread = (values: readonly number[]) =>
  [...values].sort((x, y) => x - y).join() === '-1,0,1'

export const cardSchema = z.object({
  /** Stable kebab-case slug; saved history refers to cards by this id. */
  id: z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be a kebab-case slug')),
  suit: z.enum(SUITS),
  prompt: textSchema,
  options: z.tuple([optionSchema, optionSchema, optionSchema]).check(
    z.superRefine((options, ctx) => {
      if (new Set(options.map((o) => o.id)).size !== options.length) {
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
export type CardOption = Card['options'][number]
export type OptionId = CardOption['id']

/** The bundled deck, validated once at startup so a bad card fails loudly. */
export const deck: readonly Card[] = deckSchema.parse(rawCards)
