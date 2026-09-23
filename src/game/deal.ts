/**
 * Returns `count` items drawn without repetition, in random order (Fisher–Yates).
 * `random` is injectable so tests can be deterministic.
 */
export function deal<T>(
  items: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  if (count > items.length) {
    throw new RangeError(`Cannot deal ${count} items from ${items.length}`)
  }

  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j] as T, pool[i] as T]
  }
  return pool.slice(0, count)
}
