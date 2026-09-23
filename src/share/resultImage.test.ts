import { afterEach, describe, expect, it, vi } from 'vitest'
import { resultFilename, shareOrDownload, type ShareEnvironment } from './resultImage'

const blob = new Blob(['png'], { type: 'image/png' })

function fakeEnvironment(navigator: ShareEnvironment['navigator'] = {}) {
  const link = { href: '', download: '', click: vi.fn<() => void>() }
  const env: ShareEnvironment = {
    navigator,
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

describe('shareOrDownload', () => {
  it('uses the share sheet when files can be shared', async () => {
    const share = vi.fn<Navigator['share']>().mockResolvedValue(undefined)
    const { env, link } = fakeEnvironment({ canShare: () => true, share })

    await expect(shareOrDownload(blob, 'result.png', env)).resolves.toBe('shared')

    const [[data]] = share.mock.calls as [[ShareData]]
    expect(data.files?.[0]?.name).toBe('result.png')
    expect(link.click).not.toHaveBeenCalled()
  })

  it('treats a dismissed share sheet as cancelled', async () => {
    const share = vi
      .fn<Navigator['share']>()
      .mockRejectedValue(new DOMException('dismissed', 'AbortError'))
    const { env } = fakeEnvironment({ canShare: () => true, share })

    await expect(shareOrDownload(blob, 'result.png', env)).resolves.toBe('cancelled')
  })

  it('rethrows other share failures', async () => {
    const share = vi
      .fn<Navigator['share']>()
      .mockRejectedValue(new DOMException('denied', 'NotAllowedError'))
    const { env } = fakeEnvironment({ canShare: () => true, share })

    await expect(shareOrDownload(blob, 'result.png', env)).rejects.toThrow('denied')
  })

  it.each([
    ['sharing is unsupported', {}],
    ['files cannot be shared', { canShare: () => false, share: vi.fn<Navigator['share']>() }],
  ])('downloads the file when %s', async (_, navigator) => {
    vi.useFakeTimers()
    const { env, link } = fakeEnvironment(navigator)

    await expect(shareOrDownload(blob, 'result.png', env)).resolves.toBe('downloaded')

    expect(link).toMatchObject({ href: 'blob:result', download: 'result.png' })
    expect(link.click).toHaveBeenCalledOnce()
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
