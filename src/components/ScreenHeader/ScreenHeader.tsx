import { useNavigate } from 'react-router-dom'
import './ScreenHeader.css'

interface ScreenHeaderProps {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="screen-header">
      <button
        type="button"
        className="screen-header__back"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Retour"
      >
        ←
      </button>
      <h1 className="screen-header__title">{title}</h1>
      <div className="screen-header__right">{right}</div>
    </header>
  )
}
