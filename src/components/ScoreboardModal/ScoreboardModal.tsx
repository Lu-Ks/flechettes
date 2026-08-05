import type { EngineGameState } from '../../state/gameEngine'
import { getAverage, getStandings } from '../../state/gameEngine'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import { Icon } from '../Icon/Icon'
import { flechetteIcon, moyenneIcon, poursuiteIcon } from '../../assets/icons'
import './ScoreboardModal.css'

interface ScoreboardModalProps {
  game: EngineGameState
  onClose: () => void
}

export function ScoreboardModal({ game, onClose }: ScoreboardModalProps) {
  const activeId = game.order[game.currentPlayerIndex]
  const standings = getStandings(game)

  return (
    <div className="scoreboard-modal" role="dialog" aria-modal="true">
      <div className="scoreboard-modal__backdrop" onClick={onClose} />
      <div className="scoreboard-modal__panel">
        <div className="scoreboard-modal__header">
          <h2 className="scoreboard-modal__title">SCORES</h2>
          <button type="button" className="scoreboard-modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="scoreboard-modal__body">
          {standings.map((p) => (
            <div
              key={p.player.id}
              className={`scoreboard-modal__row ${p.player.id === activeId ? 'is-active' : ''}`}
            >
              <PlayerBadge color={p.player.color} name={p.player.name} size="md" />
              {p.finishedPosition && <span className="scoreboard-modal__position">{p.finishedPosition}e</span>}
              <span className="scoreboard-modal__score">{p.remaining}</span>
              <div className="scoreboard-modal__sub">
                <span className="scoreboard-modal__sub-stat">
                  <Icon src={flechetteIcon} size="0.8em" /> {p.dartsThrown}
                </span>
                <span className="scoreboard-modal__sub-stat">
                  <Icon src={moyenneIcon} size="0.8em" /> {getAverage(p).toFixed(2)}
                </span>
                <span className="scoreboard-modal__sub-stat">
                  <Icon src={poursuiteIcon} size="0.8em" /> {p.pursuitsWon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
