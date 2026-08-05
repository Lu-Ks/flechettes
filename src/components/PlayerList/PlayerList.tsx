import type { PlayerGameState } from '../../state/types'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import './PlayerList.css'

interface PlayerListProps {
  players: PlayerGameState[]
  highlightPlayerId?: string | null
  highlightClassName?: string
  onSelectPlayer?: () => void
}

export function PlayerList({ players, highlightPlayerId, highlightClassName, onSelectPlayer }: PlayerListProps) {
  if (players.length === 0) return null

  return (
    <div className="player-list">
      {players.map((p) => {
        const rowClass = `player-list__row ${p.player.id === highlightPlayerId ? highlightClassName ?? 'is-highlighted' : ''}`
        const content = (
          <>
            <PlayerBadge color={p.player.color} name={p.player.name} size="sm" />
            {p.finishedPosition && <span className="player-list__position">{p.finishedPosition}e</span>}
            <span className="player-list__score">{p.remaining}</span>
          </>
        )
        return onSelectPlayer ? (
          <button type="button" key={p.player.id} className={`${rowClass} player-list__row--btn`} onClick={onSelectPlayer}>
            {content}
          </button>
        ) : (
          <div key={p.player.id} className={rowClass}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
