import { useMemo, useRef, useState } from 'react'
import { AlignmentChart } from '../components/AlignmentChart'
import { Jester } from '../components/Jester'
import { PixelButton } from '../components/PixelButton'
import { SUIT_TEXT } from '../components/suitStyles'
import { SUIT_COPY, alignmentCopy } from '../game/copy'
import { SUITS, type Card } from '../game/deck'
import { readingOf } from '../game/reading'
import type { Answer } from '../game/state'
import { summarize, type ResolvedPick } from '../game/summary'
import { downloadFile, renderToPng, resultFilename } from '../image/resultImage'

type SaveStatus = 'idle' | 'working' | 'saved' | 'failed'

const STATUS_TEXT: Partial<Record<SaveStatus, string>> = {
  saved: 'IMAGE SAVED!',
  failed: 'COULD NOT SAVE THE IMAGE. TRY AGAIN?',
}

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
  const reading = useMemo(() => readingOf(summary), [summary])
  const captureRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const saveImage = async () => {
    const node = captureRef.current
    if (!node) return
    setStatus('working')
    try {
      const background = getComputedStyle(document.body).backgroundColor
      downloadFile(await renderToPng(node, background), resultFilename(reading.label))
      setStatus('saved')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-5 p-6">
      <h1 className="text-center font-display text-base text-jester-300">JEVIL&apos;S READING</h1>

      {/* Padded wrapper so the box-shadow pixel border is inside the captured image. */}
      <div ref={captureRef} className="p-2">
        <section className="flex flex-col gap-5 bg-night p-6 pixel-border pixel-border-gold">
          <div className="flex items-center gap-5">
            <Jester size={96} />
            <div>
              <h2 className="font-display text-base leading-normal text-gold sm:text-xl">
                {reading.title}
              </h2>
              <p className="mt-1.5 text-lg text-jester-300">{reading.verdict}</p>
              <p
                className={`mt-1 text-lg ${reading.suitLine.suit ? SUIT_TEXT[reading.suitLine.suit] : 'text-jester-500'}`}
              >
                {reading.suitLine.text}
              </p>
            </div>
          </div>

          <div className="grid items-start gap-5 md:grid-cols-[300px_1fr]">
            <AlignmentChart alignment={summary.alignment} />
            <div className="grid gap-3">
              <Stat label="HARDEST DILEMMA" pick={summary.hardest} />
              <Stat label="QUICKEST DRAW" pick={summary.quickest} />
              <div className="bg-void p-3 pixel-border pixel-border-jester-700">
                <h3 className="mb-2 font-display text-[9px] text-jester-300">BY SUIT</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-lg">
                  {SUITS.map((suit) => {
                    const suitAlignment = summary.bySuit[suit]
                    if (!suitAlignment) return null
                    const { symbol, name } = SUIT_COPY[suit]
                    return (
                      <div key={suit} className="contents">
                        <dt className={`font-display text-[11px] leading-7 ${SUIT_TEXT[suit]}`}>
                          <span aria-hidden="true">{symbol} </span>
                          {name}
                        </dt>
                        <dd>{alignmentCopy(suitAlignment.moral, suitAlignment.ethic).label}</dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
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
                  <p className="text-jester-300">
                    <span aria-hidden="true" className={SUIT_TEXT[card.suit]}>
                      {SUIT_COPY[card.suit].symbol}{' '}
                    </span>
                    {card.prompt}
                  </p>
                  <p>{option.text}</p>
                  {answer.reason && <p className="text-jester-500 italic">“{answer.reason}”</p>}
                </div>
              </li>
            ))}
          </ol>

          <p className="text-center font-display text-[9px] text-jester-500">
            JEVIL&apos;S DILEMMA
          </p>
        </section>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <PixelButton onClick={saveImage} disabled={status === 'working'}>
          {status === 'working' ? 'SAVING...' : 'SAVE IMAGE'}
        </PixelButton>
        <PixelButton onClick={onPlayAgain}>PLAY AGAIN</PixelButton>
        <PixelButton onClick={onTitle}>TITLE</PixelButton>
      </div>
      <output className="block min-h-6 text-center font-display text-[11px] text-gold">
        {STATUS_TEXT[status]}
      </output>
    </main>
  )
}
