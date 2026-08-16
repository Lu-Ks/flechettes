import { useState } from 'react'
import type { GameHistoryEntry } from '../../state/types'
import { formatThrow } from '../../state/formatThrow'
import { formatOrdinal } from '../../state/ordinal'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { Icon } from '../../components/Icon/Icon'
import { poursuiteIcon, victoireIcon } from '../../assets/icons'
import './TurnHistory.css'

type TurnHistoryEntryLike = Pick<GameHistoryEntry, 'turns' | 'players' | 'standings'>

interface TurnHistoryProps {
  entry: TurnHistoryEntryLike
  onSelectTurn: (turnIndex: number) => void
  resumeLabel?: string
}

export function TurnHistory({ entry, onSelectTurn, resumeLabel = 'Rejouer à partir de ce tour' }: TurnHistoryProps) {
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null)

  if (!entry.turns || entry.turns.length === 0) {
    return <p className="turn-history__empty">Détail des tours non disponible pour cette partie.</p>
  }

  const playersById = new Map((entry.players ?? []).map((p) => [p.id, p]))
  const positionByPlayerId = new Map(entry.standings.map((s) => [s.playerId, s.position]))

  return (
    <div className="turn-history">
      <p className="turn-history__hint">Touchez un tour pour voir le détail et le rejouer à partir de là.</p>
      <div className="turn-history__header">
        <span>#</span>
        <span>Joueur</span>
        <span>Lancers</span>
        <span>Pts</span>
        <span>Reste</span>
      </div>

      {entry.turns.map((turn, i) => {
        const player = playersById.get(turn.playerId)
        const turnScore = turn.throws.reduce((sum, t) => sum + t.value * t.multiplier, 0)
        const targets = (turn.pursuitTargetIds ?? []).map((id) => playersById.get(id)?.name ?? id)
        const isExpanded = expandedTurn === i
        const rowClass = [
          'turn-history__row',
          turn.bust && 'is-bust',
          turn.won && 'is-win',
          turn.pursuitTriggered && 'is-pursuit',
          isExpanded && 'is-expanded',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div key={i} className={rowClass}>
            <button
              type="button"
              className="turn-history__main-btn"
              onClick={() => setExpandedTurn(isExpanded ? null : i)}
            >
              <div className="turn-history__main">
                <span className="turn-history__index">#{i + 1}</span>
                {player ? (
                  <PlayerBadge color={player.color} name={player.name} size="sm" />
                ) : (
                  <span className="turn-history__name">{turn.playerId}</span>
                )}
                <span className="turn-history__throws">{turn.throws.map(formatThrow).join('  ')}</span>
                <span className="turn-history__score">{turn.bust ? 'BUST' : turnScore}</span>
                <span className="turn-history__remaining">{turn.scoreAfter}</span>
              </div>
              {turn.won && (
                <div className="turn-history__tag turn-history__tag--win">
                  <img src={victoireIcon} alt="" className="turn-history__tag-icon" />
                  TERMINE {formatOrdinal(positionByPlayerId.get(turn.playerId) ?? 1).toUpperCase()}
                </div>
              )}
              {turn.pursuitTriggered && (
                <div className="turn-history__tag turn-history__tag--pursuit">
                  <Icon src={poursuiteIcon} size="0.9em" />
                  POURSUITE RÉUSSIE {targets.length > 0 && `— ${targets.join(', ')} reparti·e${targets.length > 1 ? 's' : ''} au début`}
                </div>
              )}
              {turn.bust && (
                <div className="turn-history__tag turn-history__tag--bust">
                  BUST — RETOUR À {turn.scoreAfter} PTS
                </div>
              )}
            </button>

            {isExpanded && (
              <button type="button" className="turn-history__resume-btn" onClick={() => onSelectTurn(i)}>
                {resumeLabel}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
