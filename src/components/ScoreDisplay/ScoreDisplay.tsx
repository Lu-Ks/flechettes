import type { Throw } from '../../state/types'
import { formatThrow } from '../../state/formatThrow'
import { Icon } from '../Icon/Icon'
import { flechetteIcon, moyenneIcon } from '../../assets/icons'
import './ScoreDisplay.css'

interface ScoreDisplayProps {
  score: number
  dartsThrown: number
  average: number
  turnThrows: Throw[]
}

export function ScoreDisplay({ score, dartsThrown, average, turnThrows }: ScoreDisplayProps) {
  const cells = [0, 1, 2].map((i) => turnThrows[i])
  const turnTotal = turnThrows.reduce((sum, t) => sum + t.value * t.multiplier, 0)
  const lastIndex = turnThrows.length - 1

  return (
    <div className="score-display">
      <div className="score-display__main">
        <span className="score-display__score">{score}</span>
        <div className="score-display__stats">
          <span className="score-display__stat">
            <Icon src={flechetteIcon} size="0.9em" /> {dartsThrown}
          </span>
          <span className="score-display__stat">
            <Icon src={moyenneIcon} size="0.9em" /> {average.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="score-display__turn">
        {cells.map((t, i) => (
          <div key={i} className={`score-display__cell ${t ? 'is-filled' : ''} ${i === lastIndex ? 'is-last' : ''}`}>
            {t ? formatThrow(t) : ''}
          </div>
        ))}
      </div>
      <div className="score-display__turn-total">{turnTotal}</div>
    </div>
  )
}
