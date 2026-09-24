import { useEffect, useState } from 'react'
import type { Player } from '../../state/types'
import { BannerInfoModal } from '../BannerInfoModal/BannerInfoModal'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import { victoireIcon } from '../../assets/icons'
import './WinnerBanner.css'

interface WinnerBannerProps {
  winner: Player
  onFinish: () => void
  /** Changes to a new truthy value whenever the popup should pop open on its own (e.g. right after a win). */
  autoOpenKey?: string | null
}

export function WinnerBanner({ winner, onFinish, autoOpenKey }: WinnerBannerProps) {
  const [closed, setClosed] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    if (!autoOpenKey) return
    setClosed(false)
    setShowDetail(true)
  }, [autoOpenKey])

  if (closed) return null

  return (
    <div className="winner-banner">
      <button type="button" className="winner-banner__main" onClick={() => setShowDetail(true)}>
        <img src={victoireIcon} alt="" className="winner-banner__icon" />
        <span className="winner-banner__text">
          <span className="winner-banner__name">{winner.name}</span> A GAGNÉ
        </span>
      </button>
      <button type="button" className="winner-banner__close" onClick={() => setClosed(true)} aria-label="Fermer">
        ×
      </button>

      {showDetail && (
        <BannerInfoModal
          onClose={() => setShowDetail(false)}
          accent="yellow"
          icon={<img src={victoireIcon} alt="" />}
          title="VICTOIRE"
        >
          <PlayerBadge color={winner.color} name={winner.name} size="md" />
          <p className="winner-banner__detail-text">La partie peut continuer pour les autres, ou se terminer maintenant.</p>
          <div className="winner-banner__actions">
            <button type="button" className="winner-banner__continue" onClick={() => setShowDetail(false)}>
              Continuer la partie
            </button>
            <button
              type="button"
              className="winner-banner__finish"
              onClick={() => {
                setShowDetail(false)
                onFinish()
              }}
            >
              Terminer la partie et voir les scores
            </button>
          </div>
        </BannerInfoModal>
      )}
    </div>
  )
}
