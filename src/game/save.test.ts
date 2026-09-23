import { describe, expect, it } from 'vitest'
import { makeCard } from '../test/fixtures'
import { reorderOptions } from './deal'
import {
  HISTORY_LIMIT,
  SAVE_KEY,
  emptySave,
  fromSavedRun,
  loadSave,
  recordRun,
  toSavedRun,
  writeSave,
  type SaveData,
  type SaveStorage,
} from './save'
import { gameReducer, initialState, type Answer, type GameState } from './state'

const card = (id: string) => makeCard(id)

const deck = [card('one'), card('two'), card('three')]

function memoryStorage(initial: Record<string, string> = {}): SaveStorage {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

const brokenStorage: SaveStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

const answer: Answer = { cardId: 'one', optionId: 'a', elapsedMs: 1500, reason: 'because' }

describe('loadSave / writeSave', () => {
  it('round-trips a save', () => {
    const storage = memoryStorage()
    const save: SaveData = {
      ...emptySave,
      history: [{ finishedAt: new Date(0).toISOString(), answers: [answer] }],
    }

    expect(writeSave(save, storage)).toBe(true)
    expect(loadSave(storage)).toEqual(save)
  })

  it.each([
    ['nothing is stored', {}],
    ['the JSON is corrupt', { [SAVE_KEY]: '{not json' }],
    ['the shape is wrong', { [SAVE_KEY]: JSON.stringify({ version: 1, current: 'nope' }) }],
    ['the version is unknown', { [SAVE_KEY]: JSON.stringify({ ...emptySave, version: 99 }) }],
  ])('returns an empty save when %s', (_, initial) => {
    expect(loadSave(memoryStorage(initial))).toEqual(emptySave)
  })

  it('discards a version 1 save from the old two-answer deck', () => {
    const v1 = { version: 1, current: null, history: [] }

    expect(loadSave(memoryStorage({ [SAVE_KEY]: JSON.stringify(v1) }))).toEqual(emptySave)
  })

  it('survives storage that throws', () => {
    expect(loadSave(brokenStorage)).toEqual(emptySave)
    expect(writeSave(emptySave, brokenStorage)).toBe(false)
  })

  it('survives storage being unavailable', () => {
    expect(loadSave(null)).toEqual(emptySave)
    expect(writeSave(emptySave, null)).toBe(false)
  })
})

describe('toSavedRun / fromSavedRun', () => {
  // Cards as dealt: answers shuffled out of their a/b/c order.
  const dealt = deck.map((c, i) => reorderOptions(c, i % 2 ? ['c', 'a', 'b'] : ['b', 'c', 'a'])!)
  const playing = [
    { type: 'start', cards: dealt },
    { type: 'pick', optionId: 'b', elapsedMs: 800 },
    { type: 'next', reason: 'fun' },
    { type: 'pick', optionId: 'a', elapsedMs: 300 },
  ] as const
  const state = playing.reduce<GameState>(gameReducer, initialState)

  it('restores an in-progress run exactly, including the dealt answer order', () => {
    const saved = toSavedRun(state)

    expect(saved).not.toBeNull()
    expect(fromSavedRun(saved!, deck)).toEqual(state)
  })

  it('stores cards by id and answer order only', () => {
    expect(toSavedRun(state)?.cards).toEqual([
      { id: 'one', order: ['b', 'c', 'a'] },
      { id: 'two', order: ['c', 'a', 'b'] },
      { id: 'three', order: ['b', 'c', 'a'] },
    ])
  })

  it('has nothing to save outside of play', () => {
    expect(toSavedRun(initialState)).toBeNull()
  })

  it('refuses a run whose cards were removed from the deck', () => {
    const saved = toSavedRun(state)!

    expect(fromSavedRun(saved, [card('one'), card('two')])).toBeNull()
  })

  it('refuses an inconsistent position', () => {
    const saved = toSavedRun(state)!

    expect(fromSavedRun({ ...saved, index: 3 }, deck)).toBeNull()
    expect(fromSavedRun({ ...saved, answers: [] }, deck)).toBeNull()
  })
})

describe('recordRun', () => {
  it('adds the newest run first and clears the current run', () => {
    const start: SaveData = {
      ...emptySave,
      current: toSavedRun(gameReducer(initialState, { type: 'start', cards: deck })),
    }

    const save = recordRun(start, [answer], new Date('2026-01-02T03:04:05.000Z'))

    expect(save.current).toBeNull()
    expect(save.history[0]).toEqual({ finishedAt: '2026-01-02T03:04:05.000Z', answers: [answer] })
  })

  it(`keeps at most ${HISTORY_LIMIT} runs`, () => {
    let save = emptySave
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      save = recordRun(save, [answer], new Date(i * 1000))
    }

    expect(save.history).toHaveLength(HISTORY_LIMIT)
    expect(save.history[0]?.finishedAt).toBe(new Date((HISTORY_LIMIT + 4) * 1000).toISOString())
  })
})
