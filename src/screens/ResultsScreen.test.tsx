import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '../game/deck'
import type { Answer } from '../game/state'
import { renderToPng, shareOrDownload } from '../share/resultImage'
import { ResultsScreen } from './ResultsScreen'

vi.mock('../share/resultImage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../share/resultImage')>()),
  renderToPng: vi.fn<typeof renderToPng>(),
  shareOrDownload: vi.fn<typeof shareOrDownload>(),
}))

const cards: Card[] = [
  {
    id: 'one',
    prompt: 'One?',
    options: [
      { id: 'a', text: 'Order', chaos: -2, good: 0 },
      { id: 'b', text: 'Chaos', chaos: 2, good: 0 },
    ],
  },
]
const answers: Answer[] = [{ cardId: 'one', optionId: 'b', elapsedMs: 1200, reason: '' }]

const renderResults = () =>
  render(
    <ResultsScreen cards={cards} answers={answers} onPlayAgain={() => {}} onTitle={() => {}} />,
  )

beforeEach(() => {
  vi.mocked(renderToPng).mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
})

describe('ResultsScreen save image', () => {
  it('renders the result card and names the file after the alignment', async () => {
    vi.mocked(shareOrDownload).mockResolvedValue('downloaded')
    const user = userEvent.setup()
    renderResults()

    await user.click(screen.getByRole('button', { name: 'SAVE IMAGE' }))

    expect(renderToPng).toHaveBeenCalledWith(expect.any(HTMLElement), expect.any(String))
    expect(shareOrDownload).toHaveBeenCalledWith(
      expect.any(Blob),
      'jevils-dilemma-chaotic-neutral.png',
    )
    expect(await screen.findByText('IMAGE SAVED!')).toBeInTheDocument()
  })

  it('says nothing when the player dismisses the share sheet', async () => {
    vi.mocked(shareOrDownload).mockResolvedValue('cancelled')
    const user = userEvent.setup()
    renderResults()

    await user.click(screen.getByRole('button', { name: 'SAVE IMAGE' }))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('button', { name: 'SAVE IMAGE' })).toBeEnabled()
  })

  it('reports a failure', async () => {
    vi.mocked(renderToPng).mockRejectedValue(new Error('canvas tainted'))
    const user = userEvent.setup()
    renderResults()

    await user.click(screen.getByRole('button', { name: 'SAVE IMAGE' }))

    expect(await screen.findByText(/could not save the image/i)).toBeInTheDocument()
  })
})
