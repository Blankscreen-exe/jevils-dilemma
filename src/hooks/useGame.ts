import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { deal } from '../game/deal'
import { CARDS_PER_RUN, type Card, type OptionId } from '../game/deck'
import {
  fromSavedRun,
  loadSave,
  recordRun,
  toSavedRun,
  writeSave,
  type SaveStorage,
} from '../game/save'
import { gameReducer, initialState, type PlayingState } from '../game/state'

/**
 * Wires the pure game reducer to the browser: deals cards, and mirrors every change
 * into the local save so a run survives a refresh.
 */
export function useGame(deck: readonly Card[], storage?: SaveStorage | null) {
  const [loaded] = useState(() => {
    const save = loadSave(storage)
    return { save, resumable: save.current ? fromSavedRun(save.current, deck) : null }
  })
  const saveRef = useRef(loaded.save)
  const [resumable, setResumable] = useState<PlayingState | null>(loaded.resumable)
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    // Leaving to the title keeps the unfinished run saved, so it can be continued.
    if (state.phase === 'title') return
    const next =
      state.phase === 'playing'
        ? { ...saveRef.current, current: toSavedRun(state) }
        : recordRun(saveRef.current, state.answers, new Date())
    saveRef.current = next
    writeSave(next, storage)
  }, [state, storage])

  const start = useCallback(() => {
    setResumable(null)
    dispatch({ type: 'start', cards: deal(deck, CARDS_PER_RUN) })
  }, [deck])

  const resume = useCallback(() => {
    if (!resumable) return
    setResumable(null)
    dispatch({ type: 'resume', run: resumable })
  }, [resumable])

  const pick = useCallback((optionId: OptionId, elapsedMs: number) => {
    dispatch({ type: 'pick', optionId, elapsedMs })
  }, [])

  const next = useCallback((reason: string) => dispatch({ type: 'next', reason }), [])

  const quit = useCallback(() => {
    if (state.phase === 'playing') setResumable(state)
    dispatch({ type: 'quit' })
  }, [state])

  return { state, canResume: resumable !== null, start, resume, pick, next, quit }
}

export type Game = ReturnType<typeof useGame>
