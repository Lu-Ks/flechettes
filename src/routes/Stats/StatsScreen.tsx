import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader'
import { Icon } from '../../components/Icon/Icon'
import { flechetteIcon, moyenneIcon, poursuiteIcon, victoireIcon, victoireGrisIcon } from '../../assets/icons'
import { getHistory, deleteHistoryEntry } from '../../storage/localStorage'
import { useGame } from '../../state/useGame'
import { TurnHistory } from '../../components/TurnHistory/TurnHistory'
import { ScoreChart } from '../../components/ScoreChart/ScoreChart'
import './StatsScreen.css'

const STATUS_LABEL: Record<string, string> = {
  finished: 'TERMINÉ',
  cancelled: 'ANNULÉ',
  in_progress: 'EN COURS',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR')
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatTiming(startIso: string, endIso?: string): string {
  if (!endIso) return `${formatDate(startIso)} · ${formatTime(startIso)}`
  const sameDay = formatDate(startIso) === formatDate(endIso)
  if (sameDay) return `${formatDate(startIso)} · ${formatTime(startIso)} → ${formatTime(endIso)}`
  return `${formatDate(startIso)} ${formatTime(startIso)} → ${formatDate(endIso)} ${formatTime(endIso)}`
}

export function StatsScreen() {
  const navigate = useNavigate()
  const { game, start, resumeFromHistory } = useGame()
  const [history, setHistory] = useState(getHistory)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [chartId, setChartId] = useState<string | null>(null)

  function confirmOverwritePausedGame() {
    if (game && game.status === 'in_progress') {
      return confirm('Une partie est en pause. La reprendre depuis l\'historique l\'annulera. Continuer ?')
    }
    return true
  }

  function rejouer(entry: ReturnType<typeof getHistory>[number]) {
    if (!entry.players || entry.players.length < 1) return
    if (!confirmOverwritePausedGame()) return
    start(entry.players, entry.settings)
    navigate('/game')
  }

  function reprendreATour(entry: ReturnType<typeof getHistory>[number], turnIndex: number) {
    if (!entry.players || entry.players.length < 1 || !entry.turns) return
    if (!confirmOverwritePausedGame()) return
    resumeFromHistory(entry.players, entry.settings, entry.turns, turnIndex)
    navigate('/game')
  }

  function supprimer(id: string) {
    if (!confirm('Supprimer cette partie de l\'historique ?')) return
    deleteHistoryEntry(id)
    setHistory((prev) => prev.filter((entry) => entry.id !== id))
  }

  return (
    <div className="stats-screen">
      <ScreenHeader title="Stats" />

      <div className="stats-screen__list">
        {history.length === 0 && <p className="stats-screen__empty">Aucune partie enregistrée pour l'instant.</p>}
        {history.map((entry) => {
          const isExpanded = expandedId === entry.id
          const isChartShown = chartId === entry.id
          const hasReplayData = Boolean(entry.players && entry.players.length > 0 && entry.turns)
          return (
            <div className="stats-screen__card" key={entry.id}>
              <button
                type="button"
                className="stats-screen__card-toggle"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="stats-screen__card-header">
                  <span>{formatTiming(entry.date, entry.endedAt)}</span>
                  <span className={`stats-screen__status stats-screen__status--${entry.status}`}>
                    <img
                      className="stats-screen__status-icon"
                      src={entry.status === 'finished' ? victoireIcon : victoireGrisIcon}
                      alt=""
                    />
                    {STATUS_LABEL[entry.status] ?? entry.status}
                  </span>
                </div>
                <p className="stats-screen__meta">
                  ({entry.settings.startScore} - DOUBLE : {entry.settings.doubleOut ? 'OUI' : 'NON'} - POURSUITE{' '}
                  {entry.settings.pursuitMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'})
                </p>
              </button>

              <div className="stats-screen__standings">
                {entry.standings.map((s) => (
                  <div className="stats-screen__standing-row" key={s.playerId}>
                    <div className="stats-screen__standing-main">
                      <span className="stats-screen__position">{s.position}.</span>
                      <span className="stats-screen__name">{s.playerName}</span>
                      <span className="stats-screen__remaining">{s.remaining}</span>
                    </div>
                    <div className="stats-screen__sub">
                      <span className="stats-screen__sub-stat">
                        <Icon src={flechetteIcon} size="0.8em" /> {s.dartsThrown}
                      </span>
                      <span className="stats-screen__sub-stat">
                        <Icon src={moyenneIcon} size="0.8em" /> {s.average.toFixed(2)}
                      </span>
                      <span className="stats-screen__sub-stat">
                        <Icon src={poursuiteIcon} size="0.8em" /> {s.pursuitsWon}
                      </span>
                    </div>
                    {s.members && (
                      <div className="stats-screen__sub">
                        {s.members.map((m) => (
                          <span className="stats-screen__sub-stat" key={m.playerId}>
                            {m.playerName} ({m.average.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isChartShown && (
                <div className="stats-screen__detail">
                  <ScoreChart turns={entry.turns} players={entry.players} startScore={entry.settings.startScore} />
                </div>
              )}

              {isExpanded && (
                <div className="stats-screen__detail">
                  <TurnHistory entry={entry} onSelectTurn={(turnIndex) => reprendreATour(entry, turnIndex)} />
                </div>
              )}

              <div className="stats-screen__actions stats-screen__actions--four">
                <button
                  type="button"
                  className="stats-screen__action"
                  onClick={() => setChartId(isChartShown ? null : entry.id)}
                  disabled={!hasReplayData}
                >
                  {isChartShown ? 'Masquer' : 'Résultat'}
                </button>
                <button
                  type="button"
                  className="stats-screen__action"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {isExpanded ? 'Masquer' : 'Tours'}
                </button>
                <button
                  type="button"
                  className="stats-screen__action stats-screen__action--replay"
                  onClick={() => rejouer(entry)}
                  disabled={!entry.players || entry.players.length < 1}
                >
                  Rejouer
                </button>
                <button
                  type="button"
                  className="stats-screen__action stats-screen__action--delete"
                  onClick={() => supprimer(entry.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
