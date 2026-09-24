import type { ButtonHTMLAttributes } from 'react'

export function PixelButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`bg-jester-900 px-4 py-3 font-display text-xs text-gold pixel-border pixel-border-gold hover:bg-jester-700 focus-visible:bg-jester-700 focus-visible:outline-none active:translate-y-1 disabled:pointer-events-none disabled:opacity-60 ${className ?? ''}`}
      {...props}
    />
  )
}
