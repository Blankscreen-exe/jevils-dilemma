import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PROJECT_URL, TITLE_GREETINGS } from '../game/copy'
import { TITLE_EXPRESSION } from '../game/expressions'
import { pokeReaction } from '../game/poke'
import { TitleScreen } from './TitleScreen'

const renderTitle = (deckStatus: 'loading' | 'ready' | 'failed' = 'ready') =>
  render(
    <TitleScreen
      deckStatus={deckStatus}
      canResume={false}
      onStart={() => {}}
      onResume={() => {}}
    />,
  )

const face = () => screen.getByTestId('jevil-head').querySelector('img')

describe('TitleScreen', () => {
  it('shows a greeting and the title face before any poke', () => {
    renderTitle()

    expect(TITLE_GREETINGS.some((line) => screen.queryByText(line))).toBe(true)
    expect(face()).toHaveAttribute('data-expression', TITLE_EXPRESSION)
  })

  it('disables START while the deck is loading', () => {
    renderTitle('loading')

    expect(screen.getByRole('button', { name: 'SHUFFLING...' })).toBeDisabled()
  })

  it('explains when the deck fails to load', () => {
    renderTitle('failed')

    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i)
  })

  it('reacts to each poke with a new line, face and shake', async () => {
    const user = userEvent.setup()
    renderTitle()

    for (let poke = 1; poke <= 3; poke++) {
      await user.click(screen.getByTestId('jevil-head'))
      const { line, face: expression } = pokeReaction(poke)

      expect(screen.getByText(line)).toBeInTheDocument()
      expect(face()).toHaveAttribute('data-expression', expression)
      expect(face()).toHaveClass('animate-shake')
    }
  })
})

describe('TitleScreen about dialog', () => {
  it('opens with the project details and GitHub link, and closes again', async () => {
    const user = userEvent.setup()
    renderTitle()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ABOUT' }))

    const dialog = screen.getByRole('dialog', { name: 'ABOUT' })
    expect(dialog).toHaveTextContent(/fan project/i)
    expect(within(dialog).getByRole('link')).toHaveAttribute('href', PROJECT_URL)

    await user.click(within(dialog).getByRole('button', { name: 'CLOSE' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('TitleScreen how-to-play dialog', () => {
  it('opens with the rules, and closes again', async () => {
    const user = userEvent.setup()
    renderTitle()

    await user.click(screen.getByRole('button', { name: 'HOW TO PLAY' }))

    const dialog = screen.getByRole('dialog', { name: 'HOW TO PLAY' })
    expect(dialog).toHaveTextContent(/CHAOS card/)

    await user.click(within(dialog).getByRole('button', { name: 'CLOSE' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
