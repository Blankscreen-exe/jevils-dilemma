import { CARDS_PER_RUN } from '../game/deck'
import { PixelDialog } from './PixelDialog'

interface HowToPlayDialogProps {
  open: boolean
  onClose: () => void
}

export function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
  return (
    <PixelDialog open={open} onClose={onClose} title="HOW TO PLAY">
      <p>
        Jevil deals {CARDS_PER_RUN} dilemmas. Pick an answer, and tell him why if you like. The last
        one is the CHAOS card: every answer is drastic, and it counts extra.
      </p>
      <p>
        There are no right answers, but he is keeping score: at the end he reveals where you stand
        on the alignment chart.
      </p>
    </PixelDialog>
  )
}
