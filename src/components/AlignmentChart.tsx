import type { Alignment, EthicAxis, MoralAxis } from '../game/alignment'
import { alignmentCopy } from '../game/copy'
import { Heart } from './Heart'

const MORALS: readonly MoralAxis[] = ['good', 'neutral', 'evil']
const ETHICS: readonly EthicAxis[] = ['lawful', 'neutral', 'chaotic']

interface AlignmentChartProps {
  alignment: Alignment
}

/** 3×3 alignment chart with the player's cell highlighted and exact position marked. */
export function AlignmentChart({ alignment }: AlignmentChartProps) {
  const { label } = alignmentCopy(alignment.moral, alignment.ethic)
  const left = ((alignment.chaos + 1) / 2) * 100
  const top = ((1 - alignment.good) / 2) * 100

  return (
    <figure
      className="grid grid-cols-[18px_1fr_18px] grid-rows-[auto_1fr_auto] gap-1.5 font-display text-[9px]"
      aria-label={`Alignment chart: ${label}`}
    >
      <figcaption className="col-start-2 text-center text-jester-300">GOOD</figcaption>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-2 rotate-180 text-center text-order [writing-mode:vertical-rl]"
      >
        LAWFUL
      </span>
      <div className="relative col-start-2 row-start-2 grid aspect-square grid-cols-3 grid-rows-3 gap-[3px]">
        {MORALS.map((moral) =>
          ETHICS.map((ethic) => {
            const isYou = moral === alignment.moral && ethic === alignment.ethic
            const cell = alignmentCopy(moral, ethic).label
            return (
              <div
                key={`${moral}-${ethic}`}
                className={`grid place-items-center p-1 text-center text-[7px] leading-normal uppercase ${
                  isYou
                    ? 'bg-jester-700 text-gold inset-ring-4 inset-ring-gold'
                    : 'bg-void text-jester-500'
                }`}
                aria-current={isYou || undefined}
              >
                {cell}
              </div>
            )
          }),
        )}
        <Heart className="absolute -translate-1/2" style={{ left: `${left}%`, top: `${top}%` }} />
      </div>
      <span
        aria-hidden="true"
        className="col-start-3 row-start-2 text-center text-chaos [writing-mode:vertical-rl]"
      >
        CHAOTIC
      </span>
      <span aria-hidden="true" className="col-start-2 row-start-3 text-center text-jester-300">
        EVIL
      </span>
    </figure>
  )
}
