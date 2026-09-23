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

export type Tier = 'slight' | 'solid' | 'pure'

/**
 * How firmly a result sits in its cell, from 0 (right on a border) to 1 (as deep as it
 * gets). For a leaning axis that means far from the neutral band; for a neutral axis it
 * means close to the centre. The two axes are averaged.
 */
export function intensityOf({ chaos, good }: Pick<Alignment, 'chaos' | 'good'>): number {
  const depth = (value: number) => {
    const distance = Math.abs(value)
    const raw =
      band(value) === 0
        ? 1 - distance / NEUTRAL_BAND
        : (distance - NEUTRAL_BAND) / (1 - NEUTRAL_BAND)
    return Math.min(1, Math.max(0, raw))
  }
  return (depth(chaos) + depth(good)) / 2
}

export function tierOf(alignment: Pick<Alignment, 'chaos' | 'good'>): Tier {
  const intensity = intensityOf(alignment)
  if (intensity < 1 / 3) return 'slight'
  if (intensity < 2 / 3) return 'solid'
  return 'pure'
}
