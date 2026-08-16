import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../state/useGame'
import {
  getActivePlayer,
  getActiveThrower,
  getAverage,
  getOtherPlayers,
  getPursuitTarget,
  getCheckoutSuggestion,
  buildTurnHistory,
} from '../../state/gameEngine'
import { PlayerBadge } from '../../components/PlayerBadge/PlayerBadge'
import { ScoreDisplay } from '../../components/ScoreDisplay/ScoreDisplay'
import { PlayerList } from '../../components/PlayerList/PlayerList'
import { PursuitBanner } from '../../components/PursuitBanner/PursuitBanner'
import { CheckoutBanner } from '../../components/CheckoutBanner/CheckoutBanner'
import { PursuitCelebration } from '../../components/PursuitCelebration/PursuitCelebration'
import { WinCelebration } from '../../components/WinCelebration/WinCelebration'
import { GameHistoryModal } from '../../components/GameHistoryModal/GameHistoryModal'
import { ScoreboardModal } from '../../components/ScoreboardModal/ScoreboardModal'
import { WinnerBanner } from '../../components/WinnerBanner/WinnerBanner'
import { NumberPad } from '../../components/NumberPad/NumberPad'
import { Icon } from '../../components/Icon/Icon'
import { accueilIcon, statsIcon } from '../../assets/icons'
import './Game.css'

const PURSUIT_CELEBRATION_DURATION = 2600
const WIN_CELEBRATION_DURATION = 2800

export function Game() {
  const navigate = useNavigate()
  const { game, throwDart, undo, finishGame, cancelGame, resumeFromHistory, pursuitEvent, winEvent } = useGame()
  const [showPursuitFx, setShowPursuitFx] = useState(false)
  const [showWinFx, setShowWinFx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(false)

  useEffect(() => {
    if (!game) {
      navigate('/setup', { replace: true })
      return
    }
    if (game.status === 'finished') {
      navigate('/result', { replace: true })
    }
  }, [game, navigate])

  useEffect(() => {
    if (!pursuitEvent) return
    setShowPursuitFx(true)
    const timer = setTimeout(() => setShowPursuitFx(false), PURSUIT_CELEBRATION_DURATION)
    return () => clearTimeout(timer)
  }, [pursuitEvent])

  useEffect(() => {
    if (!winEvent) return
    setShowWinFx(true)
    const timer = setTimeout(() => setShowWinFx(false), WIN_CELEBRATION_DURATION)
    return () => clearTimeout(timer)
  }, [winEvent])

  if (!game || game.status !== 'in_progress') return null

  const active = getActivePlayer(game)
  const thrower = getActiveThrower(game)
  const others = getOtherPlayers(game)
  const pursuitOpportunity = getPursuitTarget(game)
  const checkoutSuggestion = getCheckoutSuggestion(game)
  const winner = game.winnerId ? game.players[game.winnerId] : null

  function rembobinerAuTour(turnIndex: number) {
    if (!confirm('Revenir à ce tour ? La suite de la partie en cours sera perdue.')) return
    const players = game!.order.map((id) => game!.players[id].player)
    resumeFromHistory(players, game!.settings, buildTurnHistory(game!), turnIndex)
    setShowHistory(false)
  }

  function annulerOuTerminerLaPartie() {
    if (winner) {
      finishGame()
      return
    }
    if (!confirm('Annuler cette partie ? Elle sera enregistrée comme annulée dans les stats.')) return
    cancelGame()
    navigate('/')
  }

  return (
    <div className="game">
      <header className="game__header">
        <button type="button" className="game__quit" onClick={() => navigate('/')} aria-label="Mettre en pause et revenir au menu">
          <Icon src={accueilIcon} size="1.3rem" />
        </button>
        <button type="button" className="game__player-btn" onClick={() => setShowScoreboard(true)} aria-label="Voir les scores">
          <PlayerBadge color={active.player.color} name={active.player.name} size="lg" />
        </button>
        <button type="button" className="game__history-btn" onClick={() => setShowHistory(true)} aria-label="Voir l'historique des tours">
          <Icon src={statsIcon} size="1.3rem" />
        </button>
      </header>

      {winner && <WinnerBanner winner={winner.player} onFinish={finishGame} />}

      <ScoreDisplay
        score={active.remaining}
        dartsThrown={active.dartsThrown}
        average={getAverage(active)}
        turnThrows={game.currentTurnThrows}
        throwerName={active.team ? thrower.name : undefined}
      />

      <CheckoutBanner suggestion={checkoutSuggestion} doubleOut={game.settings.doubleOut} />
      <PursuitBanner opportunity={pursuitOpportunity} startScore={game.settings.startScore} />

      <div className="game__scroll">
        <PlayerList players={others} onSelectPlayer={() => setShowScoreboard(true)} />
      </div>

      <div className="game__pad">
        <NumberPad onThrow={throwDart} onUndo={undo} canUndo={game.log.length > 0} />
      </div>

      {showPursuitFx && pursuitEvent && (
        <PursuitCelebration
          chaser={game.players[pursuitEvent.chaserId].player}
          caught={pursuitEvent.caughtIds.map((id) => game.players[id].player)}
          startScore={game.settings.startScore}
        />
      )}

      {showWinFx && winEvent && <WinCelebration winner={game.players[winEvent.winnerId].player} />}

      {showHistory && (
        <GameHistoryModal
          game={game}
          onClose={() => setShowHistory(false)}
          onSelectTurn={rembobinerAuTour}
          onCancelGame={annulerOuTerminerLaPartie}
          canFinish={Boolean(winner)}
          onShowScoreboard={() => {
            setShowHistory(false)
            setShowScoreboard(true)
          }}
        />
      )}

      {showScoreboard && <ScoreboardModal game={game} onClose={() => setShowScoreboard(false)} />}
    </div>
  )
}
