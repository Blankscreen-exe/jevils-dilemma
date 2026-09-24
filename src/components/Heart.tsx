import type { CSSProperties } from 'react'

interface HeartProps {
  className?: string
  style?: CSSProperties
}

/** Pixel heart used as the selection cursor and chart marker. */
export function Heart({ className, style }: HeartProps) {
  return (
    <svg
      className={`h-4 w-[18px] pixelated ${className ?? ''}`}
      style={style}
      viewBox="0 0 9 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        fill="var(--color-chaos)"
        d="M1 0h2v1H1zM6 0h2v1H6zM0 1h4v1H0zM5 1h4v1H5zM0 2h9v2H0zM1 4h7v1H1zM2 5h5v1H2zM3 6h3v1H3zM4 7h1v1H4z"
      />
    </svg>
  )
}
