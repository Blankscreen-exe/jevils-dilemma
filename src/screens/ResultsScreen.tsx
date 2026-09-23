import { useMemo } from 'react'
import { AlignmentChart } from '../components/AlignmentChart'
import { Jester } from '../components/Jester'
import { PixelButton } from '../components/PixelButton'
import { alignmentCopy } from '../game/copy'
import type { Card } from '../game/deck'
import type { Answer } from '../game/state'
import { summarize, type ResolvedPick } from '../game/summary'

interface ResultsScreenProps {
  cards: readonly Card[]
  answers: readonly Answer[]
  onPlayAgain: () => void
  onTitle: () => void
}

function Stat({ label, pick }: { label: string; pick: ResolvedPick | null }) {
  if (!pick) return null
  return (
    <div className="bg-void p-3 pixel-border pixel-border-jester-700">
      <h3 className="mb-2 font-display text-[9px] text-jester-300">{label}</h3>
      <p className="text-lg leading-snug">“{pick.card.prompt}”</p>
      <p className="font-bold">{(pick.answer.elapsedMs / 1000).toFixed(1)}s</p>
    </div>
  )
}

export function ResultsScreen({ cards, answers, onPlayAgain, onTitle }: ResultsScreenProps) {
  const summary = useMemo(() => summarize(cards, answers), [cards, answers])
  const { title, verdict } = alignmentCopy(summary.alignment.moral, summary.alignment.ethic)

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-5 p-6">
      <h1 className="text-center font-display text-base text-jester-300">JEVIL&apos;S READING</h1>

      <section className="flex flex-col gap-5 bg-night p-6 pixel-border pixel-border-gold">
        <div className="flex items-center gap-5">
          <Jester size={96} />
          <div>
            <h2 className="font-display text-base leading-normal text-gold sm:text-xl">{title}</h2>
            <p className="mt-1.5 text-lg text-jester-300">{verdict}</p>
          </div>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-[300px_1fr]">
          <AlignmentChart alignment={summary.alignment} />
          <div className="grid gap-3">
            <Stat label="HARDEST DILEMMA" pick={summary.hardest} />
            <Stat label="QUICKEST DRAW" pick={summary.quickest} />
          </div>
        </div>

        <ol className="flex flex-col gap-2.5">
          {summary.picks.map(({ card, option, answer }) => (
            <li key={card.id} className="grid grid-cols-[26px_1fr] gap-2.5 leading-snug">
              <span
                aria-hidden="true"
                className={`mt-1 size-3.5 ${option.chaos > 0 ? 'bg-chaos' : option.chaos < 0 ? 'bg-order' : 'bg-jester-300'}`}
              />
              <div>
                <p className="text-jester-300">{card.prompt}</p>
                <p>{option.text}</p>
                {answer.reason && <p className="text-jester-500 italic">“{answer.reason}”</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap justify-center gap-4">
        <PixelButton onClick={onPlayAgain}>PLAY AGAIN</PixelButton>
        <PixelButton onClick={onTitle}>TITLE</PixelButton>
      </div>
    </main>
  )
}
