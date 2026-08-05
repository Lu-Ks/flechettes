import { NavLink } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import { accueilIcon, joueursIcon, statsIcon, reglagesIcon } from '../../assets/icons'
import './BottomNav.css'

const ITEMS = [
  { to: '/', label: 'ACCUEIL', icon: accueilIcon, end: true },
  { to: '/joueurs', label: 'JOUEURS', icon: joueursIcon, end: false },
  { to: '/stats', label: 'STATS', icon: statsIcon, end: false },
  { to: '/reglages', label: 'RÉGLAGES', icon: reglagesIcon, end: false },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <Icon src={item.icon} size="1.3rem" className="bottom-nav__icon" />
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
