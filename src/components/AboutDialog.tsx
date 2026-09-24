import { useEffect, useRef, type MouseEvent } from 'react'
import { PROJECT_URL } from '../game/copy'
import { PixelButton } from './PixelButton'

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Project info in a native modal <dialog>: the browser handles focus trapping, the Escape
 * key and announcing it to screen readers. Clicking the dimmed backdrop also closes it.
 */
export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // A click on the dialog element itself (not its content) is a click on the backdrop.
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    // Backdrop clicks are a mouse convenience; keyboard users close with Escape (native to
    // <dialog>) or the CLOSE button, so no keyboard handler is needed here.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby="about-title"
      onClose={onClose}
      onClick={closeOnBackdrop}
      className="m-auto max-w-lg bg-transparent p-2 text-bone backdrop:bg-void/85"
    >
      <div className="flex flex-col gap-4 bg-night p-6 text-left text-lg leading-snug pixel-border pixel-border-gold">
        <h2 id="about-title" className="font-display text-base text-gold">
          ABOUT
        </h2>
        <p>
          <strong>Jevil&apos;s Dilemma</strong> is a pixel-art take on the <em>Dilemma</em> party
          card game, hosted by Jevil from Deltarune. Answer ten dilemmas and Jevil reveals where you
          stand on the alignment chart.
        </p>
        <p>
          Built with React, TypeScript, Vite and Tailwind CSS. It installs as an app and works
          offline, and your answers never leave your device.
        </p>
        <p>
          Source code:{' '}
          <a
            href={PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="wrap-break-word text-teal underline underline-offset-4 hover:text-gold focus-visible:text-gold"
          >
            {PROJECT_URL.replace(/^https:\/\//, '')}
          </a>
        </p>
        <p className="text-base text-jester-300">
          A non-commercial fan project. Jevil and Deltarune belong to Toby Fox. <em>Dilemma</em> is
          a separate commercial card game; every question here is original. The suit icons are
          original; the Jevil sprites and heart cursor are third-party pixel art.
        </p>
        <PixelButton onClick={onClose} className="self-end">
          CLOSE
        </PixelButton>
      </div>
    </dialog>
  )
}
