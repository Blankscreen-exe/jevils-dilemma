import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { TITLE_GREETINGS } from './game/copy'
import { CARDS_PER_RUN } from './game/deck'
import { SAVE_KEY, loadSave } from './game/save'

afterEach(() => {
  localStorage.clear()
})

/** The deck loads in the background; wait until START is usable. */
async function startButton() {
  const start = await screen.findByRole('button', { name: 'START' })
  await waitFor(() => expect(start).toBeEnabled())
  return start
}

const choices = () => screen.getAllByRole('button', { pressed: false })

async function playCard(user: ReturnType<typeof userEvent.setup>, reason = '') {
  const [first] = choices()
  if (!first) throw new Error('no choices on screen')
  await user.click(first)
  if (reason) await user.type(screen.getByLabelText(/why/i), reason)
  await user.click(screen.getByRole('button', { name: /^next/i }))
}

describe('App', () => {
  it('renders the title screen', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jevil's\s*dilemma/i })).toBeInTheDocument()
    expect(await startButton()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'CONTINUE' })).not.toBeInTheDocument()
  })

  it("greets the player with one of Jevil's lines", () => {
    render(<App />)

    const shown = TITLE_GREETINGS.filter((line) => screen.queryByText(line))
    expect(shown).toHaveLength(1)
  })

  it('plays a full run through to the reading', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await startButton())
    expect(screen.getByText(`CARD 1/${CARDS_PER_RUN}`)).toBeInTheDocument()

    await playCard(user, 'no regrets')
    for (let i = 1; i < CARDS_PER_RUN; i++) await playCard(user)

    expect(screen.getByRole('heading', { name: "JEVIL'S READING" })).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: /alignment chart/i })).toBeInTheDocument()
    expect(screen.getByText('“no regrets”')).toBeInTheDocument()
    expect(loadSave().history).toHaveLength(1)
  })

  it('makes the last card the CHAOS card, with four drastic answers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await startButton())

    expect(screen.queryByText(/chaos card/i)).not.toBeInTheDocument()
    for (let i = 1; i < CARDS_PER_RUN; i++) await playCard(user)

    expect(screen.getByText(/chaos card/i)).toBeInTheDocument()
    expect(choices()).toHaveLength(4)

    await user.keyboard('d')
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('D')
  })

  it('shows a reaction and asks why after a pick', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await startButton())

    await user.keyboard('b')

    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('B')
    expect(screen.getByLabelText(/why/i)).toHaveFocus()
    expect(screen.getByLabelText(/why/i)).toHaveValue('')
  })

  it('offers to continue an unfinished run after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(await startButton())
    await playCard(user)
    await playCard(user)
    unmount()

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'CONTINUE' }))

    expect(screen.getByText(`CARD 3/${CARDS_PER_RUN}`)).toBeInTheDocument()
  })

  it('ignores a corrupt save', async () => {
    localStorage.setItem(SAVE_KEY, '{broken')

    render(<App />)

    expect(await startButton()).toBeInTheDocument()
  })
})
