import { useEffect, useState } from 'react'
import type { Card } from '../game/deck'
import { loadDeck } from '../game/loadDeck'

export type DeckState =
  { status: 'loading' } | { status: 'ready'; deck: readonly Card[] } | { status: 'failed' }

/** Loads the question deck in the background once, after the first render. */
export function useDeck(load: () => Promise<readonly Card[]> = loadDeck): DeckState {
  const [state, setState] = useState<DeckState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    load().then(
      (deck) => !cancelled && setState({ status: 'ready', deck }),
      () => !cancelled && setState({ status: 'failed' }),
    )
    return () => {
      cancelled = true
    }
  }, [load])

  return state
}
