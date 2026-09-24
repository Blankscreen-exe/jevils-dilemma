import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { PixelButton } from './PixelButton'

interface PixelDialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * A native modal <dialog> in the pixel frame: the browser handles focus trapping, the Escape
 * key and announcing it to screen readers. Clicking the dimmed backdrop also closes it.
 */
export function PixelDialog({ open, onClose, title, children }: PixelDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

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
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={closeOnBackdrop}
      className="m-auto max-w-lg bg-transparent p-2 text-bone backdrop:bg-void/85"
    >
      <div className="flex flex-col gap-4 bg-night p-5 text-left text-lg leading-snug pixel-border pixel-border-gold sm:p-6">
        <h2 id={titleId} className="font-display text-base text-gold">
          {title}
        </h2>
        {children}
        <PixelButton onClick={onClose} className="self-end">
          CLOSE
        </PixelButton>
      </div>
    </dialog>
  )
}
