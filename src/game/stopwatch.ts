/**
 * Measures active time: time spent paused (e.g. while the tab is hidden) is not counted.
 * `now` is injectable so the logic can be tested without real timers.
 */
export function createStopwatch(now: () => number) {
  let startedAt = now()
  let pausedTotal = 0
  let pausedAt: number | null = null

  return {
    restart(startPaused = false) {
      startedAt = now()
      pausedTotal = 0
      pausedAt = startPaused ? startedAt : null
    },
    pause() {
      if (pausedAt === null) pausedAt = now()
    },
    resume() {
      if (pausedAt === null) return
      pausedTotal += now() - pausedAt
      pausedAt = null
    },
    /** Active milliseconds since the last restart. */
    elapsed(): number {
      const t = now()
      const pausedNow = pausedAt === null ? 0 : t - pausedAt
      return Math.max(0, t - startedAt - pausedTotal - pausedNow)
    },
  }
}

export type Stopwatch = ReturnType<typeof createStopwatch>
