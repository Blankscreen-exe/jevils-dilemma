import { z } from 'zod'
import type { Card } from './deck'
import type { Answer, GameState } from './state'

export const SAVE_KEY = 'jevils-dilemma:save'
export const SAVE_VERSION = 1
/** Oldest finished runs are dropped beyond this. */
export const HISTORY_LIMIT = 20

const optionIdSchema = z.enum(['a', 'b'])

const answerSchema = z.object({
  cardId: z.string(),
  optionId: optionIdSchema,
  elapsedMs: z.number().nonnegative(),
  reason: z.string(),
}) satisfies z.ZodType<Answer>

/**
 * A run in progress. Cards are stored by id and looked up in the deck on load, so the
 * save stays small and picks up wording fixes to the deck.
 */
const savedRunSchema = z.object({
  cardIds: z.array(z.string()).min(1),
  index: z.int().nonnegative(),
  answers: z.array(answerSchema),
  pending: z.object({ optionId: optionIdSchema, elapsedMs: z.number().nonnegative() }).nullable(),
})

const pastRunSchema = z.object({
  finishedAt: z.iso.datetime(),
  answers: z.array(answerSchema),
})

const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  current: savedRunSchema.nullable(),
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
    cardIds: state.cards.map((card) => card.id),
    index: state.index,
    answers: [...state.answers],
    pending: state.pending,
  }
}

/**
 * Rebuilds a playing state from a saved run. Returns null if the deck no longer
 * contains every card, or the saved position is inconsistent.
 */
export function fromSavedRun(saved: SavedRun, deck: readonly Card[]): GameState | null {
  const byId = new Map(deck.map((card) => [card.id, card]))
  const cards = saved.cardIds.map((id) => byId.get(id))
  if (cards.some((card) => card === undefined)) return null
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
