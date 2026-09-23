import { useCallback, useEffect, useState } from 'react'
import { createStopwatch } from '../game/stopwatch'

/**
 * Times a decision from the moment the component mounts, pausing while the tab is
 * hidden. Remount (e.g. via `key`) to time a new decision. Returns a reader for the
 * active milliseconds.
 */
export function useDecisionTimer(): () => number {
  const [watch] = useState(() => createStopwatch(() => performance.now()))

  useEffect(() => {
    if (document.hidden) watch.pause()
    const onVisibilityChange = () => (document.hidden ? watch.pause() : watch.resume())
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [watch])

  return useCallback(() => Math.round(watch.elapsed()), [watch])
}
