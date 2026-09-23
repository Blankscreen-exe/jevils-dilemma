import { describe, expect, it } from 'vitest'
import type { Card } from './deck'
import { gameReducer, initialState, type GameAction, type GameState } from './state'

const card = (id: string): Card => ({
  id,
  prompt: `${id}?`,
  options: [
    { id: 'a', text: 'A', chaos: -1, good: 0 },
    { id: 'b', text: 'B', chaos: 1, good: 0 },
  ],
})

const cards = [card('one'), card('two')]

const run = (...actions: GameAction[]): GameState => actions.reduce(gameReducer, initialState)

describe('gameReducer', () => {
  it('starts on the title screen', () => {
    expect(initialState).toEqual({ phase: 'title' })
  })

  it('deals the first card on start', () => {
    expect(run({ type: 'start', cards })).toEqual({
      phase: 'playing',
      cards,
      index: 0,
      answers: [],
      pending: null,
    })
  })

  it('ignores a start with no cards', () => {
    expect(run({ type: 'start', cards: [] })).toBe(initialState)
  })

  it('records a pick as pending until the player moves on', () => {
    const state = run({ type: 'start', cards }, { type: 'pick', optionId: 'b', elapsedMs: 1200 })

    expect(state).toMatchObject({
      index: 0,
      answers: [],
      pending: { optionId: 'b', elapsedMs: 1200 },
    })
  })

  it('locks in the first pick for a card', () => {
    const state = run(
      { type: 'start', cards },
      { type: 'pick', optionId: 'a', elapsedMs: 500 },
      { type: 'pick', optionId: 'b', elapsedMs: 900 },
    )

    expect(state).toMatchObject({ pending: { optionId: 'a', elapsedMs: 500 } })
  })

  it('clamps negative timings to zero', () => {
    const state = run({ type: 'start', cards }, { type: 'pick', optionId: 'a', elapsedMs: -5 })

    expect(state).toMatchObject({ pending: { elapsedMs: 0 } })
  })

  it('stores the answer with a trimmed reason and deals the next card', () => {
    const state = run(
      { type: 'start', cards },
      { type: 'pick', optionId: 'a', elapsedMs: 700 },
      { type: 'next', reason: '  obviously  ' },
    )

    expect(state).toMatchObject({
      phase: 'playing',
      index: 1,
      pending: null,
      answers: [{ cardId: 'one', optionId: 'a', elapsedMs: 700, reason: 'obviously' }],
    })
  })

  it('ignores next before a pick is made', () => {
    const started = run({ type: 'start', cards })

    expect(gameReducer(started, { type: 'next', reason: '' })).toBe(started)
  })

  it('moves to results after the last card', () => {
    const state = run(
      { type: 'start', cards },
      { type: 'pick', optionId: 'a', elapsedMs: 100 },
      { type: 'next', reason: '' },
      { type: 'pick', optionId: 'b', elapsedMs: 200 },
      { type: 'next', reason: 'why not' },
    )

    expect(state).toEqual({
      phase: 'results',
      cards,
      answers: [
        { cardId: 'one', optionId: 'a', elapsedMs: 100, reason: '' },
        { cardId: 'two', optionId: 'b', elapsedMs: 200, reason: 'why not' },
      ],
    })
  })

  it('ignores picks outside of play', () => {
    expect(gameReducer(initialState, { type: 'pick', optionId: 'a', elapsedMs: 1 })).toBe(
      initialState,
    )
  })

  it('resumes a saved run from the title only', () => {
    const playing = run({ type: 'start', cards }, { type: 'pick', optionId: 'a', elapsedMs: 5 })
    if (playing.phase !== 'playing') throw new Error('expected playing')

    expect(gameReducer(initialState, { type: 'resume', run: playing })).toBe(playing)
    expect(gameReducer(playing, { type: 'resume', run: playing })).toBe(playing)
  })

  it('returns to the title on quit from any phase', () => {
    expect(run({ type: 'start', cards }, { type: 'quit' })).toEqual(initialState)
  })
})
