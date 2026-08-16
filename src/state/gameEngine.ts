import type {
  GameSettings,
  GameState,
  Player,
  PlayerGameState,
  Throw,
  TurnRecord,
} from './types'
import { generateId } from './id'

interface PursuitEffect {
  playerId: string
  remainingBefore: number
}

interface LogEntry {
  playerId: string
  throwValue: Throw
  remainingBefore: number
  remainingAfter: number
  dartsThrownBefore: number
  pointsScoredBefore: number
  turnThrowsBefore: Throw[]
  turnStartRemainingBefore: number
  currentPlayerIndexBefore: number
  bust: boolean
  statusBefore: GameState['status']
  winnerIdBefore: string | null
  pursuitEffects: PursuitEffect[]
  pursuitWinnerId: string | null
}

export interface EngineGameState extends GameState {
  log: LogEntry[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function buildInitialState(players: Player[], order: string[], settings: GameSettings): EngineGameState {
  const playerStates: Record<string, PlayerGameState> = {}
  players.forEach((player) => {
    playerStates[player.id] = {
      player,
      remaining: settings.startScore,
      dartsThrown: 0,
      pointsScored: 0,
      pursuitsWon: 0,
      finishedPosition: null,
    }
  })

  return {
    id: generateId(),
    settings,
    order,
    players: playerStates,
    currentPlayerIndex: 0,
    currentTurnThrows: [],
    turnStartRemaining: settings.startScore,
    history: [],
    status: 'in_progress',
    winnerId: null,
    createdAt: new Date().toISOString(),
    log: [],
  }
}

export function createGame(players: Player[], settings: GameSettings): EngineGameState {
  const order = (settings.randomOrder ? shuffle(players) : players).map((p) => p.id)
  return buildInitialState(players, order, settings)
}

/**
 * Rebuilds a fresh, live game state by replaying a past game's recorded turns up to (and
 * including) `turnIndex`. Used to resume a game as it stood at a given point in its history —
 * the result is a brand new game (new id), so finishing it records a separate history entry.
 */
export function replayUpToTurn(
  players: Player[],
  settings: GameSettings,
  turns: TurnRecord[],
  turnIndex: number,
): EngineGameState {
  // Players are already stored in their actual play order — never reshuffle on replay.
  const order = players.map((p) => p.id)
  let state = buildInitialState(players, order, settings)
  for (let i = 0; i <= turnIndex && i < turns.length; i++) {
    for (const t of turns[i].throws) {
      state = applyThrow(state, t.value, t.multiplier)
    }
  }
  return state
}

export function throwPoints(t: Throw): number {
  return t.value * t.multiplier
}

function isBustAfterThrow(remainingAfter: number, multiplier: number, doubleOut: boolean): boolean {
  if (remainingAfter < 0) return true
  if (remainingAfter === 1 && doubleOut) return true
  if (remainingAfter === 0 && doubleOut && multiplier !== 2) return true
  return false
}

/** Next player index that hasn't already finished, or null if everyone has finished. */
function nextUnfinishedPlayerIndex(state: GameState, players: Record<string, PlayerGameState>): number | null {
  const n = state.order.length
  for (let step = 1; step <= n; step++) {
    const idx = (state.currentPlayerIndex + step) % n
    if (players[state.order[idx]].finishedPosition === null) return idx
  }
  return null
}

/** Applies a single dart throw for the active player. Returns a new game state. */
export function applyThrow(state: EngineGameState, value: number, multiplier: 1 | 2 | 3): EngineGameState {
  if (state.status !== 'in_progress') return state
  if (value === 0 && multiplier !== 1) multiplier = 1
  if (value === 25 && multiplier === 3) return state // le triple bull n'existe pas

  const next = clone(state)
  const activeId = next.order[next.currentPlayerIndex]
  const active = next.players[activeId]
  const thrown: Throw = { value, multiplier }
  const points = throwPoints(thrown)
  const remainingBefore = active.remaining
  const remainingAfter = remainingBefore - points
  const doubleOut = next.settings.doubleOut

  const bust = isBustAfterThrow(remainingAfter, multiplier, doubleOut)
  const won = !bust && remainingAfter === 0

  const turnStartRemainingBefore = next.turnStartRemaining
  if (next.currentTurnThrows.length === 0) {
    // First dart of the turn: this is the score to fall back to if the turn busts.
    next.turnStartRemaining = remainingBefore
  }

  const logEntry: LogEntry = {
    playerId: activeId,
    throwValue: thrown,
    remainingBefore,
    remainingAfter: bust ? next.turnStartRemaining : remainingAfter,
    dartsThrownBefore: active.dartsThrown,
    pointsScoredBefore: active.pointsScored,
    turnThrowsBefore: clone(next.currentTurnThrows),
    turnStartRemainingBefore,
    currentPlayerIndexBefore: next.currentPlayerIndex,
    bust,
    statusBefore: next.status,
    winnerIdBefore: next.winnerId,
    pursuitEffects: [],
    pursuitWinnerId: null,
  }

  active.dartsThrown += 1
  active.pointsScored += bust ? 0 : points
  active.remaining = bust ? next.turnStartRemaining : remainingAfter
  next.currentTurnThrows.push(thrown)

  if (won) {
    const alreadyFinished = Object.values(next.players).filter((p) => p.finishedPosition !== null).length
    active.finishedPosition = alreadyFinished + 1
    if (!next.winnerId) next.winnerId = activeId
  } else if (!bust && next.settings.pursuitMode) {
    // Pursuit: active player catches up to another already-started player with an equal remaining score.
    for (const [otherId, otherState] of Object.entries(next.players)) {
      if (otherId === activeId) continue
      if (otherState.finishedPosition !== null) continue
      if (otherState.remaining === active.remaining && otherState.remaining < next.settings.startScore) {
        logEntry.pursuitEffects.push({ playerId: otherId, remainingBefore: otherState.remaining })
        otherState.remaining = next.settings.startScore
      }
    }
    if (logEntry.pursuitEffects.length > 0) {
      active.pursuitsWon += 1
      logEntry.pursuitWinnerId = activeId
    }
  }

  next.log.push(logEntry)

  if (bust || won || next.currentTurnThrows.length >= 3) {
    const nextIdx = nextUnfinishedPlayerIndex(next, next.players)
    if (nextIdx === null) {
      next.status = 'finished'
    } else {
      next.currentPlayerIndex = nextIdx
    }
    next.currentTurnThrows = []
  }

  return next
}

/** Ranks every still-unfinished player by their current remaining score. */
function assignFinalPositions(state: EngineGameState): void {
  const alreadyFinished = Object.values(state.players).filter((p) => p.finishedPosition !== null).length
  const unfinished = Object.values(state.players)
    .filter((p) => p.finishedPosition === null)
    .sort((a, b) => a.remaining - b.remaining)
  unfinished.forEach((p, idx) => {
    p.finishedPosition = alreadyFinished + idx + 1
  })
}

/** Manually ends the game (once at least one player has won), ranking anyone still playing by remaining score. */
export function finishGame(state: EngineGameState): EngineGameState {
  if (state.status !== 'in_progress' || !state.winnerId) return state
  const next = clone(state)
  assignFinalPositions(next)
  next.status = 'finished'
  next.currentTurnThrows = []
  return next
}

/** Reverts the most recent dart throw, restoring prior state (works across turn boundaries). */
export function undoLastThrow(state: EngineGameState): EngineGameState {
  const entry = state.log[state.log.length - 1]
  if (!entry) return state

  const next = clone(state)
  next.log.pop()

  const active = next.players[entry.playerId]
  active.remaining = entry.remainingBefore
  active.dartsThrown = entry.dartsThrownBefore
  active.pointsScored = entry.pointsScoredBefore
  active.finishedPosition = null

  entry.pursuitEffects.forEach((effect) => {
    next.players[effect.playerId].remaining = effect.remainingBefore
  })
  if (entry.pursuitWinnerId) {
    next.players[entry.pursuitWinnerId].pursuitsWon -= 1
  }

  next.currentTurnThrows = entry.turnThrowsBefore
  next.turnStartRemaining = entry.turnStartRemainingBefore
  next.currentPlayerIndex = entry.currentPlayerIndexBefore
  next.status = entry.statusBefore
  next.winnerId = entry.winnerIdBefore

  return next
}

export function getActivePlayer(state: EngineGameState): PlayerGameState {
  return state.players[state.order[state.currentPlayerIndex]]
}

/** Every other player, ordered starting from whoever plays right after the active player. */
export function getOtherPlayers(state: EngineGameState): PlayerGameState[] {
  const n = state.order.length
  const others: PlayerGameState[] = []
  for (let step = 1; step < n; step++) {
    const idx = (state.currentPlayerIndex + step) % n
    others.push(state.players[state.order[idx]])
  }
  return others
}

const DOUBLES: Throw[] = [{ value: 25, multiplier: 2 }]
const SINGLES: Throw[] = [{ value: 25, multiplier: 1 }]
const TRIPLES: Throw[] = []
for (let v = 20; v >= 1; v--) {
  DOUBLES.push({ value: v, multiplier: 2 })
  SINGLES.push({ value: v, multiplier: 1 })
  TRIPLES.push({ value: v, multiplier: 3 })
}

/** Leading dart(s) of a combo: go for the highest double first, like a real checkout attempt. */
const LEADING_DART_PRIORITY: Throw[] = [...DOUBLES, ...SINGLES, ...TRIPLES]

/** The dart that completes the count exactly: the plain number is the easiest throw to land. */
const FINAL_DART_PRIORITY: Throw[] = [...SINGLES, ...DOUBLES, ...TRIPLES]

/** Finds a combination of exactly `dartsCount` darts summing to `points`. */
function findComboExact(points: number, dartsCount: number, finalDartPool: Throw[]): Throw[] | null {
  if (dartsCount === 1) {
    const match = finalDartPool.find((t) => t.value * t.multiplier === points)
    return match ? [match] : null
  }
  for (const t of LEADING_DART_PRIORITY) {
    const value = t.value * t.multiplier
    if (value >= points) continue // leave at least 1 point for the remaining dart(s)
    const rest = findComboExact(points - value, dartsCount - 1, finalDartPool)
    if (rest) return [t, ...rest]
  }
  return null
}

/**
 * The fewest-darts way to score `points` exactly, using at most `dartsAvailable` darts.
 * `finalDartPool` constrains what the very last dart of the combo may be — e.g. doubles only,
 * to respect a "finish on a double" rule.
 */
function findThrowCombo(points: number, dartsAvailable: number, finalDartPool: Throw[] = FINAL_DART_PRIORITY): Throw[] | null {
  if (points <= 0 || dartsAvailable <= 0) return null
  for (let n = 1; n <= dartsAvailable; n++) {
    const combo = findComboExact(points, n, finalDartPool)
    if (combo) return combo
  }
  return null
}

export interface PursuitOpportunity {
  target: PlayerGameState
  pointsNeeded: number
  suggestedThrows: Throw[]
}

/**
 * The closest not-yet-finished opponent the active player could actually catch this turn —
 * only surfaced when the exact points gap is reachable with the darts left in the turn.
 */
export function getPursuitTarget(state: EngineGameState): PursuitOpportunity | null {
  if (!state.settings.pursuitMode) return null
  const active = getActivePlayer(state)
  const dartsAvailable = 3 - state.currentTurnThrows.length

  const candidates = getOtherPlayers(state)
    .filter((p) => p.finishedPosition === null && p.remaining < state.settings.startScore && p.remaining <= active.remaining)
    .map((p) => {
      const pointsNeeded = active.remaining - p.remaining
      const suggestedThrows = findThrowCombo(pointsNeeded, dartsAvailable)
      return suggestedThrows ? { target: p, pointsNeeded, suggestedThrows } : null
    })
    .filter((c): c is PursuitOpportunity => c !== null)

  if (candidates.length === 0) return null
  return candidates.reduce((closest, c) => (c.target.remaining > closest.target.remaining ? c : closest))
}

export interface CheckoutSuggestion {
  pointsNeeded: number
  suggestedThrows: Throw[]
}

/**
 * How the active player could win right now with the darts left in the turn — null if their
 * remaining score isn't exactly reachable (e.g. it's a genuine "impossible" checkout like 179,
 * or double-out is required and no double completes it).
 */
export function getCheckoutSuggestion(state: EngineGameState): CheckoutSuggestion | null {
  const active = getActivePlayer(state)
  const dartsAvailable = 3 - state.currentTurnThrows.length
  const finalDartPool = state.settings.doubleOut ? DOUBLES : FINAL_DART_PRIORITY
  const suggestedThrows = findThrowCombo(active.remaining, dartsAvailable, finalDartPool)
  return suggestedThrows ? { pointsNeeded: active.remaining, suggestedThrows } : null
}

/** Reconstructs the chronological, turn-by-turn history of a game from its throw log. */
export function buildTurnHistory(state: EngineGameState): TurnRecord[] {
  const turns: TurnRecord[] = []

  for (const entry of state.log) {
    const current = turns[turns.length - 1]
    const won = !entry.bust && entry.remainingAfter === 0
    const canMerge = current && current.playerId === entry.playerId && !current.bust && !current.won && current.throws.length < 3

    if (canMerge) {
      current.throws.push(entry.throwValue)
      current.scoreAfter = entry.remainingAfter
      current.bust = entry.bust
      current.won = won
      current.pursuitTriggered = current.pursuitTriggered || entry.pursuitEffects.length > 0
      current.pursuitTargetIds.push(...entry.pursuitEffects.map((e) => e.playerId))
    } else {
      turns.push({
        playerId: entry.playerId,
        throws: [entry.throwValue],
        scoreBefore: entry.remainingBefore,
        scoreAfter: entry.remainingAfter,
        bust: entry.bust,
        won,
        pursuitTriggered: entry.pursuitEffects.length > 0,
        pursuitTargetIds: entry.pursuitEffects.map((e) => e.playerId),
      })
    }
  }

  return turns
}

export function getAverage(p: PlayerGameState): number {
  if (p.dartsThrown === 0) return 0
  return Math.round(((p.pointsScored / p.dartsThrown) * 3) * 100) / 100
}

export function getStandings(state: EngineGameState): PlayerGameState[] {
  return [...state.order.map((id) => state.players[id])].sort((a, b) => {
    const posA = a.finishedPosition ?? Number.MAX_SAFE_INTEGER
    const posB = b.finishedPosition ?? Number.MAX_SAFE_INTEGER
    if (posA !== posB) return posA - posB
    return a.remaining - b.remaining
  })
}
