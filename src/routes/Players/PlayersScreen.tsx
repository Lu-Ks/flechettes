import { useState } from 'react'
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { Icon } from '../../components/Icon/Icon'
import { ajoutJoueurIcon } from '../../assets/icons'
import { getPlayers, savePlayers } from '../../storage/localStorage'
import { PLAYER_COLORS, type Player } from '../../state/types'
import { generateId } from '../../state/id'
import './PlayersScreen.css'

export function PlayersScreen() {
  const [players, setPlayers] = useState<Player[]>(getPlayers)
  const [newName, setNewName] = useState('')

  function persist(next: Player[]) {
    setPlayers(next)
    savePlayers(next)
  }

  function addPlayer() {
    const name = newName.trim()
    if (!name) return
    const player: Player = {
      id: generateId(),
      name,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
    }
    persist([...players, player])
    setNewName('')
  }

  function removePlayer(id: string) {
    persist(players.filter((p) => p.id !== id))
  }

  return (
    <div className="players-screen">
      <ScreenHeader title="Joueurs" />

      <div className="players-screen__add">
        <input
          className="players-screen__input"
          placeholder="Nom du joueur"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          maxLength={16}
        />
        <button type="button" className="players-screen__add-btn" onClick={addPlayer}>
          <Icon src={ajoutJoueurIcon} size="1em" /> Ajouter
        </button>
      </div>

      <div className="players-screen__list">
        {players.length === 0 && <p className="players-screen__empty">Aucun joueur enregistré pour l'instant.</p>}
        {players.map((p) => (
          <div key={p.id} className="players-screen__row">
            <PlayerBadge color={p.color} name={p.name} size="md" />
            <button
              type="button"
              className="players-screen__remove"
              onClick={() => removePlayer(p.id)}
              aria-label={`Supprimer ${p.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
