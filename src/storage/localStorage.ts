import type { GameHistoryEntry, GameState, Player, Team } from '../state/types'

const KEYS = {
  players: 'mori-score:players',
  teams: 'mori-score:teams',
  currentGame: 'mori-score:currentGame',
  history: 'mori-score:history',
  settings: 'mori-score:settings',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getPlayers(): Player[] {
  return read<Player[]>(KEYS.players, [])
}

export function savePlayers(players: Player[]): void {
  write(KEYS.players, players)
}

export function getTeams(): Team[] {
  return read<Team[]>(KEYS.teams, [])
}

export function saveTeams(teams: Team[]): void {
  write(KEYS.teams, teams)
}

export function getCurrentGame(): GameState | null {
  return read<GameState | null>(KEYS.currentGame, null)
}

export function saveCurrentGame(game: GameState | null): void {
  if (game === null) {
    localStorage.removeItem(KEYS.currentGame)
  } else {
    write(KEYS.currentGame, game)
  }
}

export function getHistory(): GameHistoryEntry[] {
  return read<GameHistoryEntry[]>(KEYS.history, [])
}

export function appendHistory(entry: GameHistoryEntry): void {
  const history = getHistory()
  history.unshift(entry)
  write(KEYS.history, history)
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter((entry) => entry.id !== id)
  write(KEYS.history, history)
}

export interface AppSettings {
  theme: 'dark' | 'light'
  sound: boolean
  vibration: boolean
  defaultStartScore: 301 | 501
  defaultDoubleOut: boolean
  defaultPursuitMode: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  sound: true,
  vibration: true,
  defaultStartScore: 301,
  defaultDoubleOut: false,
  defaultPursuitMode: true,
}

export function getSettings(): AppSettings {
  return read<AppSettings>(KEYS.settings, DEFAULT_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  write(KEYS.settings, settings)
}

export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
