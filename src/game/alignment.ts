import { SCORE_LIMIT, type CardOption } from './deck'

export type EthicAxis = 'lawful' | 'neutral' | 'chaotic'
export type MoralAxis = 'good' | 'neutral' | 'evil'

export interface Alignment {
  ethic: EthicAxis
  moral: MoralAxis
  /** Average position, -1 (lawful) … 1 (chaotic). */
  chaos: number
  /** Average position, -1 (evil) … 1 (good). */
  good: number
}

/** Values beyond ±1/3 leave the neutral band. */
const NEUTRAL_BAND = 1 / 3

function average(picks: readonly CardOption[], axis: 'chaos' | 'good'): number {
  if (picks.length === 0) return 0
  const total = picks.reduce((sum, pick) => sum + pick[axis], 0)
  return total / (picks.length * SCORE_LIMIT)
}

function band(value: number): -1 | 0 | 1 {
  if (value < -NEUTRAL_BAND) return -1
  if (value > NEUTRAL_BAND) return 1
  return 0
}

/** Places a set of picks on the 3×3 alignment chart. */
export function alignmentOf(picks: readonly CardOption[]): Alignment {
  const chaos = average(picks, 'chaos')
  const good = average(picks, 'good')
  const ethics = { [-1]: 'lawful', 0: 'neutral', 1: 'chaotic' } as const
  const morals = { [-1]: 'evil', 0: 'neutral', 1: 'good' } as const

  return { ethic: ethics[band(chaos)], moral: morals[band(good)], chaos, good }
}
