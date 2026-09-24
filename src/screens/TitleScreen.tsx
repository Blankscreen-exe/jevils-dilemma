import { useState } from 'react'
import { AboutDialog } from '../components/AboutDialog'
import { HowToPlayDialog } from '../components/HowToPlayDialog'
import { JevilFace } from '../components/JevilFace'
import { PixelButton } from '../components/PixelButton'
import { SpeechBubble } from '../components/SpeechBubble'
import { titleGreeting } from '../game/copy'
import { TITLE_EXPRESSION } from '../game/expressions'
import { pokeReaction } from '../game/poke'
import type { DeckState } from '../hooks/useDeck'

interface TitleScreenProps {
  /** The deck loads in the background; play is only possible once it is ready. */
  deckStatus: DeckState['status']
  canResume: boolean
  onStart: () => void
  onResume: () => void
}

export function TitleScreen({ deckStatus, canResume, onStart, onResume }: TitleScreenProps) {
  const ready = deckStatus === 'ready'
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  // A new greeting each time the title screen is shown.
  const [greeting] = useState(() => titleGreeting())
  // Poking Jevil's head makes him react; the count resets whenever the title screen is left.
  const [pokes, setPokes] = useState(0)
  const reaction = pokes > 0 ? pokeReaction(pokes) : { line: greeting, face: TITLE_EXPRESSION }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center sm:gap-7 sm:p-6">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        {/* Fixed size so the layout does not jump as lines change length. */}
        <SpeechBubble
          tail="down"
          className="flex min-h-19 w-72 max-w-full items-center justify-center text-center"
        >
          {reaction.line}
        </SpeechBubble>
        {/*
          Mouse/touch-only easter egg, by design: poking adds no information a keyboard or
          screen reader user misses, so it is not exposed as a button.
        */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="animate-bob [cursor:var(--cursor-heart),pointer] touch-manipulation select-none"
          onClick={() => setPokes((count) => count + 1)}
          data-testid="jevil-head"
        >
          {/* Keyed by poke count so the shake replays on every click. */}
          <JevilFace
            key={pokes}
            expression={reaction.face}
            scale={4}
            // Shrinks on shorter screens so the whole menu fits without scrolling.
            className={`[@media(700px<height<=860px)]:[--face-scale:3] [@media(max-height:700px)]:[--face-scale:2] ${pokes > 0 ? 'animate-shake' : ''}`}
          />
        </div>
      </div>
      <h1 className="font-display text-2xl leading-normal text-gold uppercase text-shadow-[4px_4px_0_var(--color-jester-700)] min-[400px]:text-3xl sm:text-4xl">
        Jevil&apos;s
        <br />
        Dilemma
      </h1>
      <p className="text-lg text-jester-300 sm:text-xl">Choose. Explain. Be judged.</p>

      <nav className="flex flex-col items-stretch gap-3 sm:gap-4" aria-label="Main menu">
        {canResume && <PixelButton onClick={onResume}>CONTINUE</PixelButton>}
        <PixelButton onClick={onStart} disabled={!ready}>
          {ready ? (canResume ? 'NEW GAME' : 'START') : 'SHUFFLING...'}
        </PixelButton>
        <PixelButton onClick={() => setShowHelp(true)} aria-haspopup="dialog">
          HOW TO PLAY
        </PixelButton>
        <PixelButton onClick={() => setShowAbout(true)} aria-haspopup="dialog">
          ABOUT
        </PixelButton>
      </nav>

      {deckStatus === 'failed' && (
        <p role="alert" className="max-w-md text-lg leading-snug text-chaos">
          The cards could not be loaded. Check your connection and reload the page.
        </p>
      )}

      <HowToPlayDialog open={showHelp} onClose={() => setShowHelp(false)} />
      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
    </main>
  )
}
