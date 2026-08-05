import { getSettings } from '../storage/localStorage'

/** No-ops silently if vibration is disabled or unsupported (e.g. iOS Safari has no Vibration API). */
export function vibrate(pattern: number | number[]): void {
  if (!getSettings().vibration) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}

export const VIBRATE_THROW = 15
export const VIBRATE_BUST = [60, 40, 60]
export const VIBRATE_WIN = [40, 30, 40, 30, 120]
