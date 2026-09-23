import { describe, expect, it } from 'vitest'
import { createStopwatch } from './stopwatch'

function fakeClock(start = 0) {
  let time = start
  return { now: () => time, advance: (ms: number) => void (time += ms) }
}

describe('createStopwatch', () => {
  it('measures time since creation', () => {
    const clock = fakeClock()
    const watch = createStopwatch(clock.now)

    clock.advance(1500)

    expect(watch.elapsed()).toBe(1500)
  })

  it('excludes paused time, including an ongoing pause', () => {
    const clock = fakeClock()
    const watch = createStopwatch(clock.now)

    clock.advance(1000)
    watch.pause()
    clock.advance(5000)
    expect(watch.elapsed()).toBe(1000)

    watch.resume()
    clock.advance(500)
    expect(watch.elapsed()).toBe(1500)
  })

  it('ignores repeated pause and resume calls', () => {
    const clock = fakeClock()
    const watch = createStopwatch(clock.now)

    watch.pause()
    clock.advance(100)
    watch.pause()
    clock.advance(100)
    watch.resume()
    watch.resume()
    clock.advance(300)

    expect(watch.elapsed()).toBe(300)
  })

  it('resets on restart, optionally starting paused', () => {
    const clock = fakeClock()
    const watch = createStopwatch(clock.now)
    clock.advance(9000)

    watch.restart(true)
    clock.advance(2000)
    expect(watch.elapsed()).toBe(0)

    watch.resume()
    clock.advance(700)
    expect(watch.elapsed()).toBe(700)
  })
})
