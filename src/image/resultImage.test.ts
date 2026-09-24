import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadFile, resultFilename, type DownloadEnvironment } from './resultImage'

const blob = new Blob(['png'], { type: 'image/png' })

function fakeEnvironment() {
  const link = { href: '', download: '', click: vi.fn<() => void>() }
  const env: DownloadEnvironment = {
    document: { createElement: () => link },
    url: {
      createObjectURL: vi.fn<typeof URL.createObjectURL>(() => 'blob:result'),
      revokeObjectURL: vi.fn<typeof URL.revokeObjectURL>(),
    },
  }
  return { env, link }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('downloadFile', () => {
  it('clicks a download link for the file, then releases the object URL', () => {
    vi.useFakeTimers()
    const { env, link } = fakeEnvironment()

    downloadFile(blob, 'result.png', env)

    expect(env.url.createObjectURL).toHaveBeenCalledWith(blob)
    expect(link).toMatchObject({ href: 'blob:result', download: 'result.png' })
    expect(link.click).toHaveBeenCalledOnce()
    expect(env.url.revokeObjectURL).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(env.url.revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })

  it('still releases the object URL if the click throws', () => {
    vi.useFakeTimers()
    const { env, link } = fakeEnvironment()
    link.click.mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => downloadFile(blob, 'result.png', env)).toThrow('blocked')

    vi.runAllTimers()
    expect(env.url.revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })
})

describe('resultFilename', () => {
  it('slugifies the alignment label', () => {
    expect(resultFilename('Chaotic Neutral')).toBe('jevils-dilemma-chaotic-neutral.png')
    expect(resultFilename('  True   Neutral! ')).toBe('jevils-dilemma-true-neutral.png')
  })
})
