import type { Card, OptionId } from './deck'

export interface Answer {
  cardId: Card['id']
  optionId: OptionId
  /** Time spent deciding, excluding time the tab was hidden. */
  elapsedMs: number
  /** Optional "why?" note; empty string when skipped. */
  reason: string
}

interface PendingPick {
  optionId: OptionId
  elapsedMs: number
}

export type GameState =
  | { phase: 'title' }
  | {
      phase: 'playing'
      cards: readonly Card[]
      /** Index of the card on the table. */
      index: number
      answers: readonly Answer[]
      /** Set once the player picks, cleared when they move on. */
      pending: PendingPick | null
    }
  | { phase: 'results'; cards: readonly Card[]; answers: readonly Answer[] }

export type GameAction =
  | { type: 'start'; cards: readonly Card[] }
  | { type: 'pick'; optionId: OptionId; elapsedMs: number }
  | { type: 'next'; reason: string }
  | { type: 'quit' }

export const initialState: GameState = { phase: 'title' }

/**
 * Pure state machine for a run. Actions that make no sense in the current phase
 * return the state unchanged instead of throwing, so stray UI events are harmless.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      if (action.cards.length === 0) return state
      return { phase: 'playing', cards: action.cards, index: 0, answers: [], pending: null }

    case 'pick':
      if (state.phase !== 'playing' || state.pending) return state
      return {
        ...state,
        pending: { optionId: action.optionId, elapsedMs: Math.max(0, action.elapsedMs) },
      }

    case 'next': {
      if (state.phase !== 'playing' || !state.pending) return state
      const card = state.cards[state.index]
      if (!card) return state

      const answers = [
        ...state.answers,
        { cardId: card.id, ...state.pending, reason: action.reason.trim() },
      ]
      const index = state.index + 1

      if (index >= state.cards.length) {
        return { phase: 'results', cards: state.cards, answers }
      }
      return { ...state, index, answers, pending: null }
    }

    case 'quit':
      return initialState
  }
}
