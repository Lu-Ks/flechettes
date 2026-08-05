import { useNavigate } from 'react-router-dom'
import { cibleIcon } from '../../assets/icons'
import { useGame } from '../../state/useGame'
import { getActivePlayer } from '../../state/gameEngine'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import './Home.css'

export function Home() {
  const navigate = useNavigate()
  const { game } = useGame()
  const paused = game && game.status === 'in_progress' ? game : null

  function choose(startScore: 301 | 501) {
    if (paused && !confirm('Une partie est en pause. En commencer une nouvelle l\'annulera. Continuer ?')) return
    navigate('/setup', { state: { startScore } })
  }

  return (
    <div className="home">
      <div className="home__title">
        <h1>MORI SCORE</h1>
        <div className="home__subtitle">
          <span className="home__dash home__dash--green" />
          DARTS PURSUIT
          <span className="home__dash home__dash--red" />
        </div>
      </div>

      {paused && (
        <button type="button" className="home__resume" onClick={() => navigate('/game')}>
          <span className="home__resume-label">PARTIE EN PAUSE</span>
          <div className="home__resume-player">
            <PlayerBadge
              color={getActivePlayer(paused).player.color}
              name={getActivePlayer(paused).player.name}
              size="md"
            />
            <span className="home__resume-score">{getActivePlayer(paused).remaining}</span>
          </div>
          <span className="home__resume-cta">REPRENDRE LA PARTIE</span>
        </button>
      )}

      <p className="home__new-game">NOUVELLE PARTIE</p>

      <div className="home__score-choice">
        <button type="button" className="home__score-btn" onClick={() => choose(301)}>
          301
        </button>
        <button type="button" className="home__score-btn" onClick={() => choose(501)}>
          501
        </button>
      </div>

      <div className="home__dartboard-wrap">
        <img className="home__dartboard" src={cibleIcon} alt="" aria-hidden="true" />
      </div>
    </div>
  )
}
