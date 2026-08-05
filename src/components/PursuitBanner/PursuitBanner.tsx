import { useState } from 'react'
import type { PursuitOpportunity } from '../../state/gameEngine'
import { formatThrow } from '../../state/formatThrow'
import { Icon } from '../Icon/Icon'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import { BannerInfoModal } from '../BannerInfoModal/BannerInfoModal'
import { poursuiteIcon } from '../../assets/icons'
import './PursuitBanner.css'

interface PursuitBannerProps {
  opportunity: PursuitOpportunity | null
  startScore: number
}

export function PursuitBanner({ opportunity, startScore }: PursuitBannerProps) {
  const [showDetail, setShowDetail] = useState(false)
  if (!opportunity) return null
  const { target, pointsNeeded, suggestedThrows } = opportunity

  return (
    <>
      <button type="button" className="pursuit-banner" onClick={() => setShowDetail(true)}>
        <Icon src={poursuiteIcon} size="1rem" className="pursuit-banner__icon" />
        <span className="pursuit-banner__text">
          <span className="pursuit-banner__chase">
            <span className="pursuit-banner__name">{target.player.name}</span> <strong>{target.remaining}</strong>
          </span>
          <span className="pursuit-banner__arrow">→</span>
          VISE {pointsNeeded}
        </span>
        <div className="pursuit-banner__combo">
          {suggestedThrows.map((t, i) => (
            <span key={i} className="pursuit-banner__combo-dart">
              {formatThrow(t)}
            </span>
          ))}
        </div>
      </button>

      {showDetail && (
        <BannerInfoModal
          onClose={() => setShowDetail(false)}
          accent="green"
          icon={<Icon src={poursuiteIcon} size="2.4rem" />}
          title="POURSUITE POSSIBLE"
        >
          <PlayerBadge color={target.player.color} name={target.player.name} size="md" />
          <p className="pursuit-banner__detail-score">{target.remaining}</p>
          <p className="pursuit-banner__detail-aim">VISE {pointsNeeded}</p>
          <div className="pursuit-banner__detail-combo">
            {suggestedThrows.map((t, i) => (
              <span key={i} className="pursuit-banner__combo-dart pursuit-banner__combo-dart--big">
                {formatThrow(t)}
              </span>
            ))}
          </div>
          <p className="pursuit-banner__detail-explain">
            Si tu marques exactement {pointsNeeded} points, {target.player.name} repart à {startScore} points.
          </p>
        </BannerInfoModal>
      )}
    </>
  )
}
