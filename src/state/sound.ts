import { getSettings } from '../storage/localStorage'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  if (!audioCtx) audioCtx = new AudioContextClass()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

interface Tone {
  freq: number
  start: number // seconds from now
  duration: number // seconds
  type?: OscillatorType
  gain?: number
}

function playTones(tones: Tone[]): void {
  const ctx = getAudioContext()
  if (!ctx) return

  for (const t of tones) {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.value = t.freq
    const startAt = ctx.currentTime + t.start
    const endAt = startAt + t.duration
    const peakGain = t.gain ?? 0.15

    gainNode.gain.setValueAtTime(0, startAt)
    gainNode.gain.linearRampToValueAtTime(peakGain, startAt + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, endAt)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(endAt + 0.02)
  }
}

/** No-ops silently if sound is disabled or the Web Audio API is unavailable. */
function playIfEnabled(tones: Tone[]): void {
  if (!getSettings().sound) return
  playTones(tones)
}

export function playThrowSound(): void {
  playIfEnabled([{ freq: 900, start: 0, duration: 0.06, type: 'triangle', gain: 0.12 }])
}

export function playBustSound(): void {
  playIfEnabled([
    { freq: 220, start: 0, duration: 0.14, type: 'sawtooth', gain: 0.14 },
    { freq: 160, start: 0.1, duration: 0.18, type: 'sawtooth', gain: 0.14 },
  ])
}

export function playPursuitSound(): void {
  playIfEnabled([
    { freq: 520, start: 0, duration: 0.1, type: 'sine', gain: 0.14 },
    { freq: 780, start: 0.09, duration: 0.16, type: 'sine', gain: 0.14 },
  ])
}

export function playWinSound(): void {
  playIfEnabled([
    { freq: 523, start: 0, duration: 0.12, type: 'sine', gain: 0.15 },
    { freq: 659, start: 0.1, duration: 0.12, type: 'sine', gain: 0.15 },
    { freq: 784, start: 0.2, duration: 0.28, type: 'sine', gain: 0.16 },
  ])
}
