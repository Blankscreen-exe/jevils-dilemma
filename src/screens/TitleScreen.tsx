import { useState } from 'react'
import { JevilFace } from '../components/JevilFace'
import { PixelButton } from '../components/PixelButton'
import { SpeechBubble } from '../components/SpeechBubble'
import { titleGreeting } from '../game/copy'
import { CARDS_PER_RUN } from '../game/deck'
import { TITLE_EXPRESSION } from '../game/expressions'

interface TitleScreenProps {
  canResume: boolean
  onStart: () => void
  onResume: () => void
}

export function TitleScreen({ canResume, onStart, onResume }: TitleScreenProps) {
  const [showHelp, setShowHelp] = useState(false)
  // A new greeting each time the title screen is shown.
  const [greeting] = useState(() => titleGreeting())

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <SpeechBubble tail="down" className="text-center">
          {greeting}
        </SpeechBubble>
        <JevilFace expression={TITLE_EXPRESSION} scale={4} className="animate-bob" />
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
          Jevil deals {CARDS_PER_RUN} dilemmas. Pick A or B, and tell him why if you like. There are
          no right answers, but he is keeping score: at the end he reveals where you stand on the
          alignment chart.
        </p>
      )}
    </main>
  )
}
