import type { Throw } from './types'

export function formatThrow(t: Throw): string {
  if (t.multiplier === 2) return `D${t.value}`
  if (t.multiplier === 3) return `T${t.value}`
  return `${t.value}`
}
