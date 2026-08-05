import { useMemo, useRef, useState } from 'react'
import type { Player, TurnRecord } from '../../state/types'
import { PlayerBadge } from '../PlayerBadge/PlayerBadge'
import './ScoreChart.css'

interface ChartPoint {
  turn: number
  value: number
}

interface PlayerSeries {
  player: Player
  remaining: ChartPoint[]
  points: ChartPoint[]
}

type Mode = 'remaining' | 'points'

function buildSeries(turns: TurnRecord[], players: Player[], startScore: number): PlayerSeries[] {
  const byPlayer = new Map<string, TurnRecord[]>()
  for (const t of turns) {
    const list = byPlayer.get(t.playerId) ?? []
    list.push(t)
    byPlayer.set(t.playerId, list)
  }

  return players.map((player) => {
    const playerTurns = byPlayer.get(player.id) ?? []
    const remaining: ChartPoint[] = [{ turn: 0, value: startScore }]
    const points: ChartPoint[] = []
    playerTurns.forEach((t, i) => {
      remaining.push({ turn: i + 1, value: t.scoreAfter })
      const turnScore = t.throws.reduce((sum, th) => sum + th.value * th.multiplier, 0)
      points.push({ turn: i + 1, value: t.bust ? 0 : turnScore })
    })
    return { player, remaining, points }
  })
}

const VIEW_W = 340
const VIEW_H = 210
const PAD_LEFT = 34
const PAD_RIGHT = 14
const PAD_TOP = 16
const PAD_BOTTOM = 26
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM

function niceMax(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step)
}

interface ScoreChartProps {
  turns: TurnRecord[]
  players: Player[]
  startScore: number
}

export function ScoreChart({ turns, players, startScore }: ScoreChartProps) {
  const [mode, setMode] = useState<Mode>('remaining')
  const [hoverTurn, setHoverTurn] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const series = useMemo(() => buildSeries(turns, players, startScore), [turns, players, startScore])

  const maxTurn = Math.max(1, ...series.map((s) => (mode === 'remaining' ? s.remaining.length - 1 : s.points.length)))

  const domainMax =
    mode === 'remaining'
      ? startScore
      : niceMax(Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value))), 20)

  const xScale = (turn: number) => PAD_LEFT + (maxTurn === 0 ? 0 : (turn / maxTurn) * PLOT_W)
  const yScale = (value: number) => PAD_TOP + (1 - value / domainMax) * PLOT_H

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(domainMax * f))
  const xTickStep = Math.max(1, Math.ceil(maxTurn / 6))
  const xTicks: number[] = []
  for (let t = mode === 'remaining' ? 0 : 1; t <= maxTurn; t += xTickStep) xTicks.push(t)

  function handlePointer(clientX: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = ((clientX - rect.left) / rect.width) * VIEW_W
    const turn = Math.round(((relX - PAD_LEFT) / PLOT_W) * maxTurn)
    setHoverTurn(Math.min(maxTurn, Math.max(mode === 'remaining' ? 0 : 1, turn)))
  }

  return (
    <div className="score-chart">
      <div className="score-chart__toggle">
        <button
          type="button"
          className={`score-chart__toggle-btn ${mode === 'remaining' ? 'is-active' : ''}`}
          onClick={() => setMode('remaining')}
        >
          SCORE RESTANT
        </button>
        <button
          type="button"
          className={`score-chart__toggle-btn ${mode === 'points' ? 'is-active' : ''}`}
          onClick={() => setMode('points')}
        >
          POINTS PAR TOUR
        </button>
      </div>

      <svg
        ref={svgRef}
        className="score-chart__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        onPointerMove={(e) => handlePointer(e.clientX)}
        onPointerLeave={() => setHoverTurn(null)}
        onPointerDown={(e) => handlePointer(e.clientX)}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line
              className="score-chart__gridline"
              x1={PAD_LEFT}
              x2={VIEW_W - PAD_RIGHT}
              y1={yScale(v)}
              y2={yScale(v)}
            />
            <text className="score-chart__axis-label" x={PAD_LEFT - 6} y={yScale(v)} textAnchor="end" dy="0.32em">
              {v}
            </text>
          </g>
        ))}

        {xTicks.map((t) => (
          <text key={t} className="score-chart__axis-label" x={xScale(t)} y={VIEW_H - 8} textAnchor="middle">
            {t}
          </text>
        ))}

        {hoverTurn !== null && (
          <line
            className="score-chart__crosshair"
            x1={xScale(hoverTurn)}
            x2={xScale(hoverTurn)}
            y1={PAD_TOP}
            y2={VIEW_H - PAD_BOTTOM}
          />
        )}

        {series.map(({ player, remaining, points }) => {
          const data = mode === 'remaining' ? remaining : points
          if (data.length === 0) return null
          const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.turn)},${yScale(p.value)}`).join(' ')
          const last = data[data.length - 1]
          return (
            <g key={player.id}>
              <path
                className="score-chart__line"
                d={path}
                stroke={`var(--player-${player.color})`}
                fill="none"
              />
              <circle
                className="score-chart__end-dot"
                cx={xScale(last.turn)}
                cy={yScale(last.value)}
                r="4"
                fill={`var(--player-${player.color})`}
              />
              <text className="score-chart__end-label" x={xScale(last.turn) + 6} y={yScale(last.value)} dy="0.32em">
                {player.name}
              </text>
            </g>
          )
        })}
      </svg>

      {hoverTurn !== null && (
        <div className="score-chart__tooltip">
          <div className="score-chart__tooltip-title">TOUR {hoverTurn}</div>
          {series.map(({ player, remaining, points }) => {
            const data = mode === 'remaining' ? remaining : points
            const point = data.find((p) => p.turn === hoverTurn)
            if (!point) return null
            return (
              <div className="score-chart__tooltip-row" key={player.id}>
                <span
                  className="score-chart__tooltip-key"
                  style={{ background: `var(--player-${player.color})` }}
                  aria-hidden="true"
                />
                <span className="score-chart__tooltip-name">{player.name}</span>
                <span className="score-chart__tooltip-value">{point.value}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="score-chart__legend">
        {series.map(({ player }) => (
          <PlayerBadge key={player.id} color={player.color} name={player.name} size="sm" />
        ))}
      </div>
    </div>
  )
}
