import type { ReactNode } from 'react'
import './BannerInfoModal.css'

interface BannerInfoModalProps {
  onClose: () => void
  accent: 'green' | 'yellow'
  icon: ReactNode
  title: string
  children: ReactNode
}

export function BannerInfoModal({ onClose, accent, icon, title, children }: BannerInfoModalProps) {
  return (
    <div className="banner-info-modal" role="dialog" aria-modal="true">
      <div className="banner-info-modal__backdrop" onClick={onClose} />
      <div className={`banner-info-modal__card banner-info-modal__card--${accent}`}>
        <button type="button" className="banner-info-modal__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <div className="banner-info-modal__icon">{icon}</div>
        <h2 className="banner-info-modal__title">{title}</h2>
        {children}
      </div>
    </div>
  )
}
