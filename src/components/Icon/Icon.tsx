import type { CSSProperties } from 'react'
import './Icon.css'

interface IconProps {
  src: string
  size?: string | number
  label?: string
  className?: string
  style?: CSSProperties
}

/**
 * Renders a monochrome SVG via CSS mask so it inherits `currentColor`
 * (theme color, player color, button color, ...) instead of a baked-in fill.
 */
export function Icon({ src, size = '1em', label, className, style }: IconProps) {
  return (
    <span
      className={`icon ${className ?? ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        ...style,
      }}
    />
  )
}
