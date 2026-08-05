import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../state/useGame'
import { buildTurnHistory, getAverage, getStandings } from '../../state/gameEngine'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { ScoreChart } from '../../components/ScoreChart/ScoreChart'
import { Icon } from '../../components/Icon/Icon'
import { flechetteIcon, moyenneIcon, poursuiteIcon, victoireIcon } from '../../assets/icons'
import { formatOrdinal } from '../../state/ordinal'
import './Result.css'

export function Result() {
  const navigate = useNavigate()
  const { game, start, clearGame } = useGame()

  useEffect(() => {
    if (!game || game.status === 'in_progress') {
      navigate('/', { replace: true })
    }
  }, [game, navigate])

  if (!game || game.status === 'in_progress') return null

  const standings = getStandings(game)
  const winner = standings[0]
  const rest = standings.slice(1)

  function revanche() {
    const players = game!.order.map((id) => game!.players[id].player)
    start(players, game!.settings)
    navigate('/game')
  }

  function changerJoueurs() {
    clearGame()
    navigate('/setup', { state: { startScore: game!.settings.startScore } })
  }

  function accueil() {
    clearGame()
    navigate('/')
  }

  return (
    <div className="result">
      <div className="result__header">RÉSULTAT</div>

      <img className="result__trophy" src={victoireIcon} alt="Trophée de victoire" />
      <h1 className="result__victory">VICTOIRE</h1>
      <div className="result__winner">
        <PlayerBadge color={winner.player.color} name={winner.player.name} size="lg" />
      </div>

      <div className="result__stats">
        <div className="result__stat-row">
          <span>
            <Icon src={flechetteIcon} size="1em" /> FLÉCHETTES
          </span>
          <span>{winner.dartsThrown}</span>
        </div>
        <div className="result__stat-row">
          <span>
            <Icon src={moyenneIcon} size="1em" /> MOYENNE
          </span>
          <span>{getAverage(winner).toFixed(2)}</span>
        </div>
        <div className="result__stat-row">
          <span>
            <Icon src={poursuiteIcon} size="1em" /> POURSUITE RÉUSSI
          </span>
          <span>{winner.pursuitsWon}</span>
        </div>
      </div>

      {rest.length > 0 && (
        <div className="result__standings">
          {rest.map((p, idx) => (
            <div className="result__standing-row" key={p.player.id}>
              <div className="result__standing-main">
                <span className="result__position">{formatOrdinal(idx + 2)}</span>
                <PlayerBadge color={p.player.color} name={p.player.name} size="sm" />
                <span className="result__standing-score">{p.remaining}</span>
              </div>
              <div className="result__standing-sub">
                <Icon src={flechetteIcon} size="0.85em" /> {p.dartsThrown} ·{' '}
                <Icon src={moyenneIcon} size="0.85em" /> {getAverage(p).toFixed(2)} ·{' '}
                <Icon src={poursuiteIcon} size="0.85em" /> {p.pursuitsWon}
              </div>
            </div>
          ))}
        </div>
      )}

      <ScoreChart
        turns={buildTurnHistory(game)}
        players={game.order.map((id) => game.players[id].player)}
        startScore={game.settings.startScore}
      />

      <div className="result__actions">
        <button type="button" className="result__btn result__btn--primary" onClick={revanche}>
          REVANCHE
        </button>
        <button type="button" className="result__btn" onClick={changerJoueurs}>
          CHANGER
          <br />
          DE JOUEURS
        </button>
        <button type="button" className="result__btn" onClick={accueil}>
          ACCUEIL
        </button>
      </div>
    </div>
  )
}
