import type { Player } from '../../state/types'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import { poursuiteIcon } from '../../assets/icons'
import { Icon } from '../Icon/Icon'
import './PursuitCelebration.css'

interface PursuitCelebrationProps {
  chaser: Player
  caught: Player[]
  startScore: number
}

export function PursuitCelebration({ chaser, caught, startScore }: PursuitCelebrationProps) {
  const caughtNames = caught.map((p) => p.name).join(', ')

  return (
    <div className="pursuit-celebration" role="status">
      <div className="pursuit-celebration__card">
        <Icon src={poursuiteIcon} size="2.4rem" className="pursuit-celebration__icon" />
        <div className="pursuit-celebration__chaser">
          <PlayerBadge color={chaser.color} name={chaser.name} size="md" />
        </div>
        <p className="pursuit-celebration__text">
          A RATTRAPÉ <strong>{caughtNames}</strong>
        </p>
        <p className="pursuit-celebration__sub">
          {caughtNames} {caught.length > 1 ? 'repartent' : 'repart'} à {startScore}
        </p>
      </div>
    </div>
  )
}
