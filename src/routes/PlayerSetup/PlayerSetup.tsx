import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { Icon } from '../../components/Icon/Icon'
import { ajoutJoueurIcon } from '../../assets/icons'
import { useGame } from '../../state/useGame'
import { getPlayers, getSettings } from '../../storage/localStorage'
import { PLAYER_COLORS, type Player } from '../../state/types'
import { generateId } from '../../state/id'
import './PlayerSetup.css'

function nextColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}

/** First-ever run (no saved players at all) gets 4 quick-start placeholders; otherwise just the real saved players. */
function defaultPlayers(): Player[] {
  const saved = getPlayers()
  if (saved.length > 0) return saved.slice(0, 4)
  return Array.from({ length: 4 }, (_, i) => ({ id: generateId(), name: `Joueur ${i + 1}`, color: nextColor(i) }))
}

export function PlayerSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { start } = useGame()
  const settings = useMemo(getSettings, [])
  const startScore = (location.state as { startScore?: 301 | 501 } | null)?.startScore ?? settings.defaultStartScore

  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [randomOrder, setRandomOrder] = useState(false)
  const [doubleOut, setDoubleOut] = useState(settings.defaultDoubleOut)
  const [pursuitMode, setPursuitMode] = useState(settings.defaultPursuitMode)

  function renamePlayer(id: string, name: string) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  function addPlayer() {
    setPlayers((prev) => [
      ...prev,
      { id: generateId(), name: `Joueur ${prev.length + 1}`, color: nextColor(prev.length) },
    ])
  }

  function handleStart() {
    const validPlayers = players.filter((p) => p.name.trim().length > 0)
    if (validPlayers.length < 1) return
    start(validPlayers, { startScore, randomOrder, doubleOut, pursuitMode })
    navigate('/game')
  }

  return (
    <div className="player-setup">
      <ScreenHeader title="Choix des joueurs" />

      <div className="player-setup__score">{startScore}</div>

      <div className="player-setup__list">
        {players.map((p) => (
          <div className="player-setup__row" key={p.id}>
            <PlayerBadge color={p.color} name="" size="md" />
            <input
              className="player-setup__input"
              value={p.name}
              onChange={(e) => renamePlayer(p.id, e.target.value)}
              maxLength={16}
            />
            <button
              type="button"
              className="player-setup__remove"
              onClick={() => removePlayer(p.id)}
              aria-label={`Retirer ${p.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="player-setup__add" onClick={addPlayer}>
        <Icon src={ajoutJoueurIcon} size="1.1em" /> Ajouter un joueur
      </button>

      <div className="player-setup__options">
        <label className="player-setup__option">
          <input type="checkbox" checked={randomOrder} onChange={(e) => setRandomOrder(e.target.checked)} />
          Ordre aléatoire
        </label>
        <label className="player-setup__option">
          <input type="checkbox" checked={doubleOut} onChange={(e) => setDoubleOut(e.target.checked)} />
          Finir sur un double
        </label>
        <label className="player-setup__option">
          <input type="checkbox" checked={pursuitMode} onChange={(e) => setPursuitMode(e.target.checked)} />
          Mode poursuite
          <span className="player-setup__hint">
            Si un joueur égale le score d'un joueur précédent, ce joueur repart au début
          </span>
        </label>
      </div>

      <button
        type="button"
        className="player-setup__start"
        onClick={handleStart}
        disabled={players.filter((p) => p.name.trim()).length < 1}
      >
        COMMENCER
      </button>
    </div>
  )
}
