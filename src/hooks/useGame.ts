import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { dealRun } from '../game/deal'
import type { Card, OptionId } from '../game/deck'
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
 * into the local save so a run survives a refresh. `deck` is null while it is still
 * loading; nothing can be dealt or resumed until it arrives.
 */
export function useGame(deck: readonly Card[] | null, storage?: SaveStorage | null) {
  const [initialSave] = useState(() => loadSave(storage))
  const saveRef = useRef(initialSave)
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // The run saved before this visit can only be rebuilt once the deck has loaded.
  const savedRun = useMemo(
    () => (deck && initialSave.current ? fromSavedRun(initialSave.current, deck) : null),
    [deck, initialSave],
  )
  // Quitting mid-run keeps that run available to continue.
  const [quitRun, setQuitRun] = useState<PlayingState | null>(null)
  // Starting or resuming uses up the saved run offered on the title screen.
  const [savedRunUsed, setSavedRunUsed] = useState(false)
  const resumable = quitRun ?? (savedRunUsed ? null : savedRun)

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
    if (!deck) return
    setQuitRun(null)
    setSavedRunUsed(true)
    dispatch({ type: 'start', cards: dealRun(deck) })
  }, [deck])

  const resume = useCallback(() => {
    if (!resumable) return
    setQuitRun(null)
    setSavedRunUsed(true)
    dispatch({ type: 'resume', run: resumable })
  }, [resumable])

  const pick = useCallback((optionId: OptionId, elapsedMs: number) => {
    dispatch({ type: 'pick', optionId, elapsedMs })
  }, [])

  const next = useCallback((reason: string) => dispatch({ type: 'next', reason }), [])

  const quit = useCallback(() => {
    if (state.phase === 'playing') setQuitRun(state)
    dispatch({ type: 'quit' })
  }, [state])

  return {
    state,
    ready: deck !== null,
    canResume: resumable !== null,
    start,
    resume,
    pick,
    next,
    quit,
  }
}

export type Game = ReturnType<typeof useGame>
