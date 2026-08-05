import type { PlayerColor } from '../../state/types'
import { Icon } from '../Icon/Icon'
import { flechetteIcon } from '../../assets/icons'
import './PlayerBadge.css'

interface PlayerBadgeProps {
  color: PlayerColor
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function PlayerBadge({ color, name, size = 'md' }: PlayerBadgeProps) {
  return (
    <span className={`player-badge player-badge--${size}`}>
      <Icon src={flechetteIcon} className="dart-icon" style={{ color: `var(--player-${color})` }} />
      <span className="player-badge__name">{name}</span>
    </span>
  )
}
