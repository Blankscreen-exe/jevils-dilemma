import * as z from 'zod/mini'
import { reorderOptions } from './deal'
import { OPTION_IDS, type Card } from './deck'
import type { Answer, GameState, PlayingState } from './state'

export const SAVE_KEY = 'jevils-dilemma:save'
/**
 * Bump when the saved shape changes. v2: three answers per card and a saved answer order.
 * Older saves fail validation and are discarded (their cards no longer exist).
 */
export const SAVE_VERSION = 2
/** Oldest finished runs are dropped beyond this. */
export const HISTORY_LIMIT = 20

const optionIdSchema = z.enum(OPTION_IDS)

const answerSchema = z.object({
  cardId: z.string(),
  optionId: optionIdSchema,
  elapsedMs: z.number().check(z.nonnegative()),
  reason: z.string(),
}) satisfies z.ZodMiniType<Answer>

/**
 * A run in progress. Cards are stored by id (plus the order their answers were dealt in)
 * and looked up in the deck on load, so the save stays small and picks up wording fixes.
 */
const savedRunSchema = z.object({
  cards: z
    .array(z.object({ id: z.string(), order: z.array(optionIdSchema) }))
    .check(z.minLength(1)),
  index: z.int().check(z.nonnegative()),
  answers: z.array(answerSchema),
  pending: z.nullable(
    z.object({ optionId: optionIdSchema, elapsedMs: z.number().check(z.nonnegative()) }),
  ),
})

const pastRunSchema = z.object({
  finishedAt: z.iso.datetime(),
  answers: z.array(answerSchema),
})

const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  current: z.nullable(savedRunSchema),
  history: z.array(pastRunSchema),
})

export type SavedRun = z.infer<typeof savedRunSchema>
export type PastRun = z.infer<typeof pastRunSchema>
export type SaveData = z.infer<typeof saveSchema>

/** The subset of the Web Storage API we use; injectable for tests. */
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>

export const emptySave: SaveData = { version: SAVE_VERSION, current: null, history: [] }

/** `localStorage`, or null where it is missing or merely touching it throws (some privacy modes). */
function browserStorage(): SaveStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/**
 * Reads the save. Missing, unreadable, corrupt or outdated data yields an empty save
 * rather than an error: losing a half-played run is better than a game that won't start.
 */
export function loadSave(storage: SaveStorage | null = browserStorage()): SaveData {
  try {
    const raw = storage?.getItem(SAVE_KEY)
    if (!raw) return emptySave
    const parsed = saveSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : emptySave
  } catch {
    return emptySave
  }
}

/** Writes the save; returns false if storage is unavailable or full. */
export function writeSave(data: SaveData, storage: SaveStorage | null = browserStorage()): boolean {
  try {
    if (!storage) return false
    storage.setItem(SAVE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/** Snapshot of a run in progress, or null when there is nothing to resume. */
export function toSavedRun(state: GameState): SavedRun | null {
  if (state.phase !== 'playing') return null
  return {
    cards: state.cards.map((card) => ({ id: card.id, order: card.options.map((o) => o.id) })),
    index: state.index,
    answers: [...state.answers],
    pending: state.pending,
  }
}

/**
 * Rebuilds a playing state from a saved run. Returns null if the deck no longer contains
 * every card with the same answers, or the saved position is inconsistent.
 */
export function fromSavedRun(saved: SavedRun, deck: readonly Card[]): PlayingState | null {
  const byId = new Map(deck.map((card) => [card.id, card]))
  const cards = saved.cards.map(({ id, order }) => {
    const card = byId.get(id)
    return card ? reorderOptions(card, order) : null
  })
  if (cards.some((card) => card === null)) return null
  if (saved.index >= cards.length || saved.answers.length !== saved.index) return null

  return {
    phase: 'playing',
    cards: cards as Card[],
    index: saved.index,
    answers: saved.answers,
    pending: saved.pending,
  }
}

/** Adds a finished run to the history, newest first, capped at HISTORY_LIMIT. */
export function recordRun(save: SaveData, answers: readonly Answer[], finishedAt: Date): SaveData {
  const run: PastRun = { finishedAt: finishedAt.toISOString(), answers: [...answers] }
  return { ...save, current: null, history: [run, ...save.history].slice(0, HISTORY_LIMIT) }
}
