/*
 * Placeholder jester drawn from a pixel map. It is original art, not the game sprite;
 * swap this component's contents for the final Jevil artwork.
 */
const MAP = [
  '................',
  '.GG..........GG.',
  '.GG..........GG.',
  '..PP........LL..',
  '...PPP....LLL...',
  '...PPPP..LLLL...',
  '....PPPPLLLL....',
  '....PPPPLLLL....',
  '...PPPPPLLLLL...',
  '...GGGGGGGGGG...',
  '...GGTGGGGTGG...',
  '...WWWWWWWWWW...',
  '...WKKWWWWKKW...',
  '...WWWWWWWWWW...',
  '...WKGKGKGKGW...',
  '...WWKKKKKKWW...',
  '....WWWWWWWW....',
  '.....TTTTTT.....',
]

const PALETTE: Record<string, string> = {
  G: 'var(--color-gold)',
  P: 'var(--color-jester-500)',
  L: 'var(--color-jester-300)',
  W: 'var(--color-bone)',
  K: 'var(--color-void)',
  T: 'var(--color-teal)',
}

const WIDTH = 16
const HEIGHT = MAP.length

const PIXELS = MAP.flatMap((row, y) =>
  [...row].flatMap((key, x) => {
    const fill = PALETTE[key]
    return fill ? [{ x, y, fill }] : []
  }),
)

interface JesterProps {
  /** Rendered width in CSS pixels; height follows the sprite's aspect ratio. */
  size: number
  className?: string
}

export function Jester({ size, className }: JesterProps) {
  return (
    <svg
      className={`pixelated ${className ?? ''}`}
      width={size}
      height={(size * HEIGHT) / WIDTH}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {PIXELS.map(({ x, y, fill }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
      ))}
    </svg>
  )
}
