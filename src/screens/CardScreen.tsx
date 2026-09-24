import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react'
import { JevilFace } from '../components/JevilFace'
import { PixelButton } from '../components/PixelButton'
import { SpeechBubble } from '../components/SpeechBubble'
import { SuitIcon } from '../components/SuitIcon'
import { SUIT_TEXT } from '../components/suitStyles'
import { CHAOS_INTRO_LINE, SUIT_COPY, paceOf, reactionLine } from '../game/copy'
import {
  CHAOS_WEIGHT,
  answersFor,
  isChaosCard,
  type Card,
  type CardOption,
  type OptionId,
} from '../game/deck'
import {
  CHAOS_EXPRESSION,
  IDLE_EXPRESSION,
  expressionForPace,
  type Expression,
} from '../game/expressions'
import type { PlayingState } from '../game/state'
import { useDecisionTimer } from '../hooks/useDecisionTimer'

/** Answer cards are labelled by position; ids stay hidden because order is shuffled. */
const LETTERS = ['A', 'B', 'C', 'D'] as const

/** Hotkey -> answer position. */
const HOTKEYS: Record<string, number> = { a: 0, 1: 0, b: 1, 2: 1, c: 2, 3: 2, d: 3, 4: 3 }

interface CardScreenProps {
  state: PlayingState
  onPick: (optionId: OptionId, elapsedMs: number) => void
  onNext: (reason: string) => void
  onQuit: () => void
}

export function CardScreen({ state, onPick, onNext, onQuit }: CardScreenProps) {
  const card = state.cards[state.index]
  if (!card) return null
  const chaos = isChaosCard(state.index, state.cards.length)

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-5 p-6">
      <header className="flex items-center justify-between font-display text-[11px] text-jester-300">
        <span>
          CARD {state.index + 1}/{state.cards.length}
        </span>
        <ol className="flex gap-1.5" aria-hidden="true">
          {state.cards.map((c, i) => (
            <li
              key={c.id}
              className={`size-2.5 ${i < state.index ? 'bg-jester-500' : i === state.index ? 'bg-gold' : isChaosCard(i, state.cards.length) ? 'bg-chaos' : 'bg-jester-900'}`}
            />
          ))}
        </ol>
        <button
          type="button"
          onClick={onQuit}
          className="text-jester-300 hover:text-gold focus-visible:text-gold"
        >
          QUIT
        </button>
      </header>

      {/* Keyed by card so the reaction, note and timer reset for each new card. */}
      <Dilemma
        key={card.id}
        card={card}
        chaos={chaos}
        pickedId={state.pending?.optionId ?? null}
        onPick={onPick}
        onNext={onNext}
      />
    </main>
  )
}

interface DilemmaProps {
  card: Card
  /** The CHAOS card: shows the four drastic answers, which count CHAOS_WEIGHT times. */
  chaos: boolean
  pickedId: OptionId | null
  onPick: (optionId: OptionId, elapsedMs: number) => void
  onNext: (reason: string) => void
}

function Dilemma({ card, chaos, pickedId, onPick, onNext }: DilemmaProps) {
  const readElapsed = useDecisionTimer()
  const answers = answersFor(card, chaos)
  // Jevil announces the CHAOS card as soon as it is dealt.
  const [reaction, setReaction] = useState<{
    line: string | null
    face: Expression
    shake: boolean
  }>(
    chaos
      ? { line: CHAOS_INTRO_LINE, face: CHAOS_EXPRESSION, shake: true }
      : { line: null, face: IDLE_EXPRESSION, shake: false },
  )
  const [reason, setReason] = useState('')
  const reasonRef = useRef<HTMLInputElement>(null)
  const locked = pickedId !== null

  useEffect(() => {
    if (locked) reasonRef.current?.focus()
  }, [locked])

  const choose = (option: CardOption) => {
    if (locked) return
    const elapsedMs = readElapsed()
    const pace = paceOf(elapsedMs)
    setReaction({
      line: reactionLine(pace),
      face: expressionForPace(pace),
      shake: pace === 'quick',
    })
    onPick(option.id, elapsedMs)
  }

  const onHotkey = useEffectEvent((event: KeyboardEvent) => {
    if (locked || event.target instanceof HTMLInputElement) return
    const position = HOTKEYS[event.key.toLowerCase()]
    const option = position === undefined ? undefined : answers[position]
    if (!option) return
    // Stop the key from also being typed into the "why?" box that takes focus next.
    event.preventDefault()
    choose(option)
  })

  useEffect(() => {
    window.addEventListener('keydown', onHotkey)
    return () => window.removeEventListener('keydown', onHotkey)
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onNext(reason)
  }

  const suit = SUIT_COPY[card.suit]
  const suitColor = SUIT_TEXT[card.suit]

  return (
    <>
      <div className="flex items-end gap-4">
        <JevilFace
          key={reaction.face}
          expression={reaction.face}
          scale={2}
          className={reaction.shake ? 'animate-shake' : ''}
        />
        <SpeechBubble text={reaction.line} />
      </div>

      <div className="flex flex-col items-center gap-2 px-3 text-center">
        {chaos && (
          <p className="animate-shake bg-chaos px-3 py-1.5 font-display text-xs text-void pixel-border pixel-border-gold">
            CHAOS CARD · COUNTS ×{CHAOS_WEIGHT} · NO SAFE ANSWERS
          </p>
        )}
        <p className={`flex items-center gap-2 font-display text-[11px] ${suitColor}`}>
          <SuitIcon suit={card.suit} />
          {suit.name}
        </p>
        <h2 className="text-2xl leading-snug">{card.prompt}</h2>
      </div>

      <fieldset className="flex-1">
        <legend className="sr-only">
          Choose an answer ({LETTERS.slice(0, answers.length).join(', ')})
        </legend>
        <div className={`grid h-full gap-5 ${chaos ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {answers.map((option, i) => {
            const letter = LETTERS[i]
            const isPicked = option.id === pickedId
            const look = !locked
              ? `hover:-translate-y-3 hover:pixel-border-gold focus-visible:-translate-y-3 focus-visible:pixel-border-gold ${chaos ? 'bg-jester-900 pixel-border-chaos' : ''}`
              : isPicked
                ? '-translate-y-4 bg-jester-900 pixel-border-gold'
                : 'translate-y-1 rotate-2 opacity-30'
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option)}
                disabled={locked}
                aria-pressed={isPicked}
                className={`relative flex min-h-32 animate-deal items-center justify-center bg-night px-5 py-10 text-lg leading-snug pixel-border transition-transform duration-150 ease-[steps(3)] focus-visible:outline-none ${chaos ? 'md:min-h-40' : 'md:min-h-60'} ${look}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span
                  className={`absolute top-3 left-3 flex items-center gap-1.5 font-display text-sm ${suitColor}`}
                >
                  {letter}
                  <SuitIcon suit={card.suit} />
                </span>
                <span>{option.text}</span>
                <span
                  aria-hidden="true"
                  className={`absolute right-3 bottom-3 flex rotate-180 items-center gap-1.5 font-display text-sm ${suitColor}`}
                >
                  {letter}
                  <SuitIcon suit={card.suit} />
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {locked && (
        <form onSubmit={submit} className="flex flex-col gap-2.5">
          <label htmlFor="reason" className="font-display text-[11px] text-jester-300">
            WHY? (OPTIONAL)
          </label>
          <div className="flex gap-3">
            <input
              id="reason"
              ref={reasonRef}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={80}
              autoComplete="off"
              placeholder="Defend yourself..."
              className="min-w-0 flex-1 bg-night p-3 text-lg pixel-border pixel-border-jester-500 placeholder:text-jester-500 focus:outline-none focus:pixel-border-gold"
            />
            <PixelButton type="submit">NEXT ▸</PixelButton>
          </div>
        </form>
      )}
    </>
  )
}
