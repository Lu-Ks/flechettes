import type { EngineGameState } from '../../state/gameEngine'
import { buildStandingsSummary, buildTurnHistory } from '../../state/gameEngine'
import { TurnHistory } from '../TurnHistory/TurnHistory'
import './GameHistoryModal.css'

interface GameHistoryModalProps {
  game: EngineGameState
  onClose: () => void
  onSelectTurn: (turnIndex: number) => void
  onCancelGame: () => void
  onShowScoreboard: () => void
  canFinish: boolean
}

export function GameHistoryModal({
  game,
  onClose,
  onSelectTurn,
  onCancelGame,
  onShowScoreboard,
  canFinish,
}: GameHistoryModalProps) {
  const entry = {
    turns: buildTurnHistory(game),
    players: game.order.map((id) => game.players[id].player),
    standings: buildStandingsSummary(game),
  }

  return (
    <div className="game-history-modal" role="dialog" aria-modal="true">
      <div className="game-history-modal__backdrop" onClick={onClose} />
      <div className="game-history-modal__panel">
        <div className="game-history-modal__header">
          <h2 className="game-history-modal__title">HISTORIQUE DE LA PARTIE</h2>
          <button type="button" className="game-history-modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="game-history-modal__body">
          <TurnHistory entry={entry} onSelectTurn={onSelectTurn} resumeLabel="Revenir à ce tour" />
        </div>
        <div className="game-history-modal__footer">
          <button type="button" className="game-history-modal__scores" onClick={onShowScoreboard}>
            Voir les scores
          </button>
          <button
            type="button"
            className={canFinish ? 'game-history-modal__finish' : 'game-history-modal__cancel'}
            onClick={onCancelGame}
          >
            {canFinish ? 'Terminer la partie' : 'Annuler la partie'}
          </button>
        </div>
      </div>
    </div>
  )
}
