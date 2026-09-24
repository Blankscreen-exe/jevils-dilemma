import { PROJECT_URL } from '../game/copy'
import { PixelDialog } from './PixelDialog'

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <PixelDialog open={open} onClose={onClose} title="ABOUT">
      <p>
        <strong>Jevil&apos;s Dilemma</strong> is a pixel-art take on the <em>Dilemma</em> party card
        game, hosted by Jevil from Deltarune. Answer ten dilemmas and Jevil reveals where you stand
        on the alignment chart.
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
        A non-commercial fan project. Jevil and Deltarune belong to Toby Fox. <em>Dilemma</em> is a
        separate commercial card game; every question here is original. The suit icons are original;
        the Jevil sprites and heart cursor are third-party pixel art.
      </p>
    </PixelDialog>
  )
}
