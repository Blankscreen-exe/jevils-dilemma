interface SpeechBubbleProps {
  /** Nothing is shown while null; the live region stays mounted so updates are announced. */
  text: string | null
}

export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <p
      aria-live="polite"
      className={`relative max-w-72 bg-bone px-3.5 py-2.5 font-display text-[11px] leading-relaxed text-void pixel-border pixel-border-bone ${text ? '' : 'invisible'}`}
    >
      {text}
      <span
        aria-hidden="true"
        className="absolute bottom-2 -left-3 border-6 border-transparent border-r-bone"
      />
    </p>
  )
}
