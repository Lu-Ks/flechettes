export type PlayerColor = 'red' | 'green' | 'orange' | 'purple' | 'blue' | 'pink'

export const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'orange', 'purple', 'blue', 'pink']

export interface Player {
  id: string
  name: string
  color: PlayerColor
}

export interface Throw {
  value: number // 0-20 or 25
  multiplier: 1 | 2 | 3
}

export interface TurnRecord {
  playerId: string
  throws: Throw[]
  scoreBefore: number
  scoreAfter: number
  bust: boolean
  won: boolean
  pursuitTriggered: boolean
  pursuitTargetIds: string[] // players caught up to and reset by this turn
}

export interface GameSettings {
  startScore: 301 | 501
  randomOrder: boolean
  doubleOut: boolean
  pursuitMode: boolean
}

export interface PlayerGameState {
  player: Player
  remaining: number
  dartsThrown: number
  pointsScored: number
  pursuitsWon: number
  finishedPosition: number | null
}

export type GameStatus = 'in_progress' | 'finished' | 'cancelled'

export interface GameState {
  id: string
  settings: GameSettings
  order: string[] // player ids in turn order
  players: Record<string, PlayerGameState>
  currentPlayerIndex: number
  currentTurnThrows: Throw[]
  history: TurnRecord[]
  status: GameStatus
  winnerId: string | null
  createdAt: string
}

export interface GameHistoryEntry {
  id: string
  date: string // start timestamp
  endedAt: string // finished/cancelled timestamp
  settings: GameSettings
  status: GameStatus
  players: Player[] // original line-up, used to replay this game
  turns: TurnRecord[] // chronological, every turn of every player
  standings: {
    playerId: string
    playerName: string
    position: number
    dartsThrown: number
    average: number
    pursuitsWon: number
    remaining: number
  }[]
}
