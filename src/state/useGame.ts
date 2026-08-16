import { useCallback, useEffect, useState } from 'react'
import {
  applyThrow as engineApplyThrow,
  createGame,
  type EngineGameState,
  undoLastThrow as engineUndo,
  finishGame as engineFinishGame,
  replayUpToTurn,
  buildTurnHistory,
  getAverage,
  getStandings,
} from './gameEngine'
import { getCurrentGame, saveCurrentGame, appendHistory, savePlayers } from '../storage/localStorage'
import type { GameHistoryEntry, GameSettings, Player, TurnRecord } from './types'
import { generateId } from './id'
import { vibrate, VIBRATE_THROW, VIBRATE_BUST, VIBRATE_WIN } from './vibrate'
import { playThrowSound, playBustSound, playWinSound, playPursuitSound } from './sound'

export interface PursuitEvent {
  id: string
  chaserId: string
  caughtIds: string[]
}

export interface WinEvent {
  id: string
  winnerId: string
}

export function useGame() {
  const [game, setGame] = useState<EngineGameState | null>(() => {
    const loaded = getCurrentGame() as EngineGameState | null
    if (loaded && loaded.turnStartRemaining === undefined) {
      // Backward compat: games saved before turnStartRemaining existed.
      loaded.turnStartRemaining = loaded.players[loaded.order[loaded.currentPlayerIndex]].remaining
    }
    return loaded
  })
  const [pursuitEvent, setPursuitEvent] = useState<PursuitEvent | null>(null)
  const [winEvent, setWinEvent] = useState<WinEvent | null>(null)

  useEffect(() => {
    saveCurrentGame(game)
    if (game && game.status !== 'in_progress') {
      recordHistory(game)
    }
  }, [game])

  const start = useCallback((players: Player[], settings: GameSettings) => {
    savePlayers(players)
    const fresh = createGame(players, settings)
    saveCurrentGame(fresh)
    setGame(fresh)
    return fresh
  }, [])

  const throwDart = useCallback((value: number, multiplier: 1 | 2 | 3) => {
    setGame((current) => {
      if (!current) return current
      const next = engineApplyThrow(current, value, multiplier)
      if (next === current) return next // rejected throw (e.g. triple bull) — no feedback

      const lastEntry = next.log[next.log.length - 1]
      if (lastEntry.bust) {
        vibrate(VIBRATE_BUST)
        playBustSound()
      } else if (next.players[lastEntry.playerId].finishedPosition !== null) {
        vibrate(VIBRATE_WIN)
        playWinSound()
        setWinEvent({ id: generateId(), winnerId: lastEntry.playerId })
      } else {
        vibrate(VIBRATE_THROW)
        playThrowSound()
      }
      if (lastEntry.pursuitEffects.length > 0) {
        playPursuitSound()
        setPursuitEvent({
          id: generateId(),
          chaserId: lastEntry.playerId,
          caughtIds: lastEntry.pursuitEffects.map((e) => e.playerId),
        })
      }
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setGame((current) => (current ? engineUndo(current) : current))
  }, [])

  const clearGame = useCallback(() => {
    saveCurrentGame(null)
    setGame(null)
  }, [])

  /** Abandons the in-progress game: records it as cancelled in history, then clears it. */
  const cancelGame = useCallback(() => {
    if (!game || game.status !== 'in_progress') return
    recordHistory({ ...game, status: 'cancelled' })
    saveCurrentGame(null)
    setGame(null)
  }, [game])

  const finishGame = useCallback(() => {
    setGame((current) => (current ? engineFinishGame(current) : current))
  }, [])

  /** Resumes a game as it stood after a given turn in a past game's history (a brand new game). */
  const resumeFromHistory = useCallback(
    (players: Player[], settings: GameSettings, turns: TurnRecord[], turnIndex: number) => {
      savePlayers(players)
      const resumed = replayUpToTurn(players, settings, turns, turnIndex)
      saveCurrentGame(resumed)
      setGame(resumed)
      return resumed
    },
    [],
  )

  return { game, start, throwDart, undo, clearGame, cancelGame, finishGame, resumeFromHistory, pursuitEvent, winEvent }
}

let lastRecordedGameId: string | null = null

function recordHistory(game: EngineGameState) {
  if (lastRecordedGameId === game.id) return
  lastRecordedGameId = game.id
  const standings = getStandings(game).map((p, idx) => ({
    playerId: p.player.id,
    playerName: p.player.name,
    position: p.finishedPosition ?? idx + 1,
    dartsThrown: p.dartsThrown,
    average: getAverage(p),
    pursuitsWon: p.pursuitsWon,
    remaining: p.remaining,
  }))
  const entry: GameHistoryEntry = {
    id: game.id,
    date: game.createdAt,
    endedAt: new Date().toISOString(),
    settings: game.settings,
    status: game.status,
    players: game.order.map((id) => game.players[id].player),
    turns: buildTurnHistory(game),
    standings,
  }
  appendHistory(entry)
}
