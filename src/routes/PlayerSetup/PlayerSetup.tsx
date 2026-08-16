import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { Icon } from '../../components/Icon/Icon'
import { ajoutJoueurIcon } from '../../assets/icons'
import { useGame } from '../../state/useGame'
import { getPlayers, getTeams, getSettings, saveTeams } from '../../storage/localStorage'
import { PLAYER_COLORS, type Player, type PlayerColor, type Team } from '../../state/types'
import { generateId } from '../../state/id'
import './PlayerSetup.css'

interface TeamDraft {
  id: string
  name: string
  color: PlayerColor
  members: Player[]
}

function nextColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}

/** First-ever run (no saved players at all) gets 4 quick-start placeholders; otherwise just the real saved players. */
function defaultPlayers(): Player[] {
  const saved = getPlayers()
  if (saved.length > 0) return saved.slice(0, 4)
  return Array.from({ length: 4 }, (_, i) => ({ id: generateId(), name: `Joueur ${i + 1}`, color: nextColor(i) }))
}

function makeMember(existing: Player | undefined, idx: number, color: PlayerColor): Player {
  return existing ? { ...existing, color } : { id: generateId(), name: `Joueur ${idx + 1}`, color }
}

/** Reuses the last saved team lineup if there is one, otherwise splits saved/placeholder players into 2 teams of 2. */
function defaultTeams(): TeamDraft[] {
  const savedTeams = getTeams()
  const savedPlayers = getPlayers()
  const byId = new Map(savedPlayers.map((p) => [p.id, p]))

  if (savedTeams.length > 0) {
    return savedTeams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      members:
        t.memberIds.length > 0
          ? t.memberIds.map((id, i) => makeMember(byId.get(id), i, t.color))
          : [makeMember(undefined, 0, t.color)],
    }))
  }

  const pool = savedPlayers
  return [0, 1].map((ti) => {
    const color = nextColor(ti)
    return {
      id: generateId(),
      name: `Équipe ${ti + 1}`,
      color,
      members: [makeMember(pool[ti * 2], ti * 2, color), makeMember(pool[ti * 2 + 1], ti * 2 + 1, color)],
    }
  })
}

export function PlayerSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { start } = useGame()
  const settings = useMemo(getSettings, [])
  const startScore = (location.state as { startScore?: 301 | 501 } | null)?.startScore ?? settings.defaultStartScore

  const [teamMode, setTeamMode] = useState(false)
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [teams, setTeams] = useState<TeamDraft[]>(defaultTeams)
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

  function renameTeam(teamId: string, name: string) {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, name } : t)))
  }

  function addTeam() {
    setTeams((prev) => {
      const color = nextColor(prev.length)
      return [
        ...prev,
        {
          id: generateId(),
          name: `Équipe ${prev.length + 1}`,
          color,
          members: [{ id: generateId(), name: 'Joueur 1', color }],
        },
      ]
    })
  }

  function removeTeam(teamId: string) {
    setTeams((prev) => (prev.length > 2 ? prev.filter((t) => t.id !== teamId) : prev))
  }

  function renameMember(teamId: string, memberId: string, name: string) {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, members: t.members.map((m) => (m.id === memberId ? { ...m, name } : m)) } : t,
      ),
    )
  }

  function addMember(teamId: string) {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, members: [...t.members, { id: generateId(), name: `Joueur ${t.members.length + 1}`, color: t.color }] }
          : t,
      ),
    )
  }

  function removeMember(teamId: string, memberId: string) {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t)),
    )
  }

  const validTeams = teams
    .map((t) => ({ ...t, members: t.members.filter((m) => m.name.trim().length > 0) }))
    .filter((t) => t.members.length > 0)
  const canStart = teamMode
    ? validTeams.length >= 2
    : players.filter((p) => p.name.trim()).length >= 1

  function handleStart() {
    if (teamMode) {
      if (validTeams.length < 2) return
      const allMembers = validTeams.flatMap((t) => t.members)
      const teamDefs: Team[] = validTeams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        memberIds: t.members.map((m) => m.id),
      }))
      saveTeams(teamDefs)
      start(allMembers, { startScore, randomOrder, doubleOut, pursuitMode, teamMode: true, teams: teamDefs })
      navigate('/game')
      return
    }

    const validPlayers = players.filter((p) => p.name.trim().length > 0)
    if (validPlayers.length < 1) return
    start(validPlayers, { startScore, randomOrder, doubleOut, pursuitMode, teamMode: false })
    navigate('/game')
  }

  return (
    <div className="player-setup">
      <ScreenHeader title="Choix des joueurs" />

      <div className="player-setup__score">{startScore}</div>

      <div className="player-setup__mode">
        <button
          type="button"
          className={`player-setup__mode-btn ${!teamMode ? 'is-active' : ''}`}
          onClick={() => setTeamMode(false)}
        >
          Solo
        </button>
        <button
          type="button"
          className={`player-setup__mode-btn ${teamMode ? 'is-active' : ''}`}
          onClick={() => setTeamMode(true)}
        >
          Équipes
        </button>
      </div>

      {!teamMode && (
        <>
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
        </>
      )}

      {teamMode && (
        <div className="player-setup__teams">
          {teams.map((team) => (
            <div className="player-setup__team" key={team.id}>
              <div className="player-setup__team-header">
                <PlayerBadge color={team.color} name="" size="md" />
                <input
                  className="player-setup__input player-setup__team-name"
                  value={team.name}
                  onChange={(e) => renameTeam(team.id, e.target.value)}
                  maxLength={20}
                />
                <button
                  type="button"
                  className="player-setup__remove"
                  onClick={() => removeTeam(team.id)}
                  disabled={teams.length <= 2}
                  aria-label={`Retirer ${team.name}`}
                >
                  ×
                </button>
              </div>

              <div className="player-setup__team-members">
                {team.members.map((m) => (
                  <div className="player-setup__row" key={m.id}>
                    <input
                      className="player-setup__input"
                      value={m.name}
                      onChange={(e) => renameMember(team.id, m.id, e.target.value)}
                      maxLength={16}
                    />
                    <button
                      type="button"
                      className="player-setup__remove"
                      onClick={() => removeMember(team.id, m.id)}
                      disabled={team.members.length <= 1}
                      aria-label={`Retirer ${m.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="player-setup__add-member" onClick={() => addMember(team.id)}>
                <Icon src={ajoutJoueurIcon} size="1em" /> Ajouter un joueur
              </button>
            </div>
          ))}

          <button type="button" className="player-setup__add" onClick={addTeam}>
            <Icon src={ajoutJoueurIcon} size="1.1em" /> Ajouter une équipe
          </button>
        </div>
      )}

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

      <button type="button" className="player-setup__start" onClick={handleStart} disabled={!canStart}>
        COMMENCER
      </button>
    </div>
  )
}
