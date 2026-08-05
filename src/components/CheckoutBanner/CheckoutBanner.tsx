import { useState } from 'react'
import type { CheckoutSuggestion } from '../../state/gameEngine'
import { formatThrow } from '../../state/formatThrow'
import { BannerInfoModal } from '../BannerInfoModal/BannerInfoModal'
import { victoireIcon } from '../../assets/icons'
import './CheckoutBanner.css'

interface CheckoutBannerProps {
  suggestion: CheckoutSuggestion | null
  doubleOut: boolean
}

export function CheckoutBanner({ suggestion, doubleOut }: CheckoutBannerProps) {
  const [showDetail, setShowDetail] = useState(false)
  if (!suggestion) return null
  const { pointsNeeded, suggestedThrows } = suggestion

  return (
    <>
      <button type="button" className="checkout-banner" onClick={() => setShowDetail(true)}>
        <img src={victoireIcon} alt="" className="checkout-banner__icon" />
        <span className="checkout-banner__text">FINITION · VISE {pointsNeeded}</span>
        <div className="checkout-banner__combo">
          {suggestedThrows.map((t, i) => (
            <span key={i} className="checkout-banner__combo-dart">
              {formatThrow(t)}
            </span>
          ))}
        </div>
      </button>

      {showDetail && (
        <BannerInfoModal
          onClose={() => setShowDetail(false)}
          accent="yellow"
          icon={<img src={victoireIcon} alt="" />}
          title="FINITION POSSIBLE"
        >
          <p className="checkout-banner__detail-aim">VISE {pointsNeeded}</p>
          <div className="checkout-banner__detail-combo">
            {suggestedThrows.map((t, i) => (
              <span key={i} className="checkout-banner__combo-dart checkout-banner__combo-dart--big">
                {formatThrow(t)}
              </span>
            ))}
          </div>
          <p className="checkout-banner__detail-explain">
            Marque exactement {pointsNeeded} points pour gagner la partie
            {doubleOut ? ' — la dernière fléchette doit être un double.' : '.'}
          </p>
        </BannerInfoModal>
      )}
    </>
  )
}
