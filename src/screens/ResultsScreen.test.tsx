import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Answer } from '../game/state'
import { downloadFile, renderToPng } from '../image/resultImage'
import { makeCard } from '../test/fixtures'
import { ResultsScreen } from './ResultsScreen'

vi.mock('../image/resultImage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../image/resultImage')>()),
  renderToPng: vi.fn<typeof renderToPng>(),
  downloadFile: vi.fn<typeof downloadFile>(),
}))

// Option c is Chaotic Good (see makeCard).
const cards = [makeCard('one', 'diamonds')]
const answers: Answer[] = [{ cardId: 'one', optionId: 'c', elapsedMs: 1200, reason: '' }]

const renderResults = () =>
  render(
    <ResultsScreen cards={cards} answers={answers} onPlayAgain={() => {}} onTitle={() => {}} />,
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(renderToPng).mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
})

describe('ResultsScreen save image', () => {
  it('downloads the result card, named after the alignment', async () => {
    const user = userEvent.setup()
    renderResults()

    await user.click(screen.getByRole('button', { name: 'SAVE IMAGE' }))

    expect(renderToPng).toHaveBeenCalledWith(expect.any(HTMLElement), expect.any(String))
    expect(downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'jevils-dilemma-chaotic-good.png')
    expect(await screen.findByText('IMAGE SAVED!')).toBeInTheDocument()
  })

  it('reports a failure', async () => {
    vi.mocked(renderToPng).mockRejectedValue(new Error('canvas tainted'))
    const user = userEvent.setup()
    renderResults()

    await user.click(screen.getByRole('button', { name: 'SAVE IMAGE' }))

    expect(await screen.findByText(/could not save the image/i)).toBeInTheDocument()
    expect(downloadFile).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'SAVE IMAGE' })).toBeEnabled()
  })
})
