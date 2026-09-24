import { useState } from 'react'
import { JevilFace } from '../components/JevilFace'
import { PixelButton } from '../components/PixelButton'
import { SpeechBubble } from '../components/SpeechBubble'
import { titleGreeting } from '../game/copy'
import { CARDS_PER_RUN } from '../game/deck'
import { TITLE_EXPRESSION } from '../game/expressions'
import { pokeReaction } from '../game/poke'

interface TitleScreenProps {
  canResume: boolean
  onStart: () => void
  onResume: () => void
}

export function TitleScreen({ canResume, onStart, onResume }: TitleScreenProps) {
  const [showHelp, setShowHelp] = useState(false)
  // A new greeting each time the title screen is shown.
  const [greeting] = useState(() => titleGreeting())
  // Poking Jevil's head makes him react; the count resets whenever the title screen is left.
  const [pokes, setPokes] = useState(0)
  const reaction = pokes > 0 ? pokeReaction(pokes) : { line: greeting, face: TITLE_EXPRESSION }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
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
            className={pokes > 0 ? 'animate-shake' : ''}
          />
        </div>
      </div>
      <h1 className="font-display text-3xl leading-normal text-gold uppercase text-shadow-[4px_4px_0_var(--color-jester-700)] sm:text-4xl">
        Jevil&apos;s
        <br />
        Dilemma
      </h1>
      <p className="text-xl text-jester-300">Choose. Explain. Be judged.</p>

      <nav className="flex flex-col items-stretch gap-4" aria-label="Main menu">
        {canResume && <PixelButton onClick={onResume}>CONTINUE</PixelButton>}
        <PixelButton onClick={onStart}>{canResume ? 'NEW GAME' : 'START'}</PixelButton>
        <PixelButton onClick={() => setShowHelp((open) => !open)} aria-expanded={showHelp}>
          HOW TO PLAY
        </PixelButton>
      </nav>

      {showHelp && (
        <p className="max-w-md text-lg leading-snug text-bone">
          Jevil deals {CARDS_PER_RUN} dilemmas. Pick an answer, and tell him why if you like. The
          last one is the CHAOS card: every answer is drastic, and it counts extra. There are no
          right answers, but he is keeping score: at the end he reveals where you stand on the
          alignment chart.
        </p>
      )}
    </main>
  )
}
