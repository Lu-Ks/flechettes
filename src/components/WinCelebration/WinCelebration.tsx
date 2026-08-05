import type { Player } from '../../state/types'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import { victoireIcon } from '../../assets/icons'
import './WinCelebration.css'

interface WinCelebrationProps {
  winner: Player
}

export function WinCelebration({ winner }: WinCelebrationProps) {
  return (
    <div className="win-celebration" role="status">
      <div className="win-celebration__card">
        <img src={victoireIcon} alt="" className="win-celebration__icon" />
        <div className="win-celebration__winner">
          <PlayerBadge color={winner.color} name={winner.name} size="lg" />
        </div>
        <p className="win-celebration__text">A GAGNÉ !</p>
      </div>
    </div>
  )
}
