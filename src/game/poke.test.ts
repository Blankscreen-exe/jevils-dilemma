import { describe, expect, it } from 'vitest'
import { EXPRESSIONS } from './expressions'
import { EASTER_EGG_POKE, pokeReaction } from './poke'

const lines = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => pokeReaction(from + i).line)

describe('pokeReaction', () => {
  it('starts playful', () => {
    expect(pokeReaction(1)).toEqual({ line: 'UEE HEE! THAT TICKLES!', face: 'excited' })
  })

  it('escalates from playful to irritated to annoyed', () => {
    const playful = new Set(lines(1, 4))
    const irritated = new Set(lines(5, 9))
    const annoyed = new Set(lines(10, 14))

    expect([...irritated].some((line) => playful.has(line))).toBe(false)
    expect([...annoyed].some((line) => irritated.has(line) || playful.has(line))).toBe(false)
  })

  it(`shows the special line only on poke ${EASTER_EGG_POKE}`, () => {
    const special = pokeReaction(EASTER_EGG_POKE).line
    const others = [...lines(1, EASTER_EGG_POKE - 1), ...lines(EASTER_EGG_POKE + 1, 60)]

    expect(others).not.toContain(special)
  })

  it('stays annoyed after the special line', () => {
    expect(new Set(lines(16, 40))).toEqual(new Set(lines(10, 14)))
  })

  it('never repeats a line twice in a row', () => {
    const all = lines(1, 60)

    all.slice(1).forEach((line, i) => expect(line).not.toBe(all[i]))
  })

  it('changes the face on every poke', () => {
    const faces = Array.from({ length: 60 }, (_, i) => pokeReaction(i + 1).face)

    faces.slice(1).forEach((face, i) => expect(face).not.toBe(faces[i]))
  })

  it('only uses real expressions', () => {
    for (let poke = 1; poke <= 20; poke++) {
      expect(EXPRESSIONS).toContain(pokeReaction(poke).face)
    }
  })
})
