import { z } from 'zod'
import rawCards from '../data/cards.json'

/** Cards dealt in a single run. */
export const CARDS_PER_RUN = 10

/** Scores run from -2 to +2 on each axis. */
export const SCORE_LIMIT = 2

const scoreSchema = z.int().min(-SCORE_LIMIT).max(SCORE_LIMIT)

const optionSchema = z.object({
  text: z.string().trim().min(1),
  /** -2 lawful … +2 chaotic */
  chaos: scoreSchema,
  /** -2 evil … +2 good */
  good: scoreSchema,
})

export const cardSchema = z.object({
  /** Stable kebab-case slug; saved history refers to cards by this id. */
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
  prompt: z.string().trim().min(1),
  options: z.tuple([
    optionSchema.extend({ id: z.literal('a') }),
    optionSchema.extend({ id: z.literal('b') }),
  ]),
})

export const deckSchema = z
  .array(cardSchema)
  .min(CARDS_PER_RUN, `deck needs at least ${CARDS_PER_RUN} cards for one run`)
  .superRefine((cards, ctx) => {
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
  })

export type Card = z.infer<typeof cardSchema>
export type CardOption = Card['options'][number]
export type OptionId = CardOption['id']

/** The bundled deck, validated once at startup so a bad card fails loudly. */
export const deck: readonly Card[] = deckSchema.parse(rawCards)
