import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { doubleIcon, tripleIcon } from '../../assets/icons'
import './NumberPad.css'

interface NumberPadProps {
  onThrow: (value: number, multiplier: 1 | 2 | 3) => void
  onUndo: () => void
  canUndo: boolean
}

const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1)

export function NumberPad({ onThrow, onUndo, canUndo }: NumberPadProps) {
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1)

  function press(value: number) {
    if (value === 25 && multiplier === 3) return // le triple bull n'existe pas
    onThrow(value, multiplier)
    setMultiplier(1)
  }

  function toggleMultiplier(m: 2 | 3) {
    setMultiplier((current) => (current === m ? 1 : m))
  }

  return (
    <div className="number-pad">
      <div className="number-pad__grid">
        {NUMBERS.map((n) => (
          <button key={n} type="button" className="number-pad__btn" onClick={() => press(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="number-pad__footer">
        <button
          type="button"
          className="number-pad__btn number-pad__btn--bull"
          onClick={() => press(25)}
          disabled={multiplier === 3}
        >
          25
        </button>
        <button type="button" className="number-pad__btn number-pad__btn--miss" onClick={() => press(0)}>
          0
        </button>
        <div className="number-pad__multi-stack">
          <button
            type="button"
            className={`number-pad__btn number-pad__btn--multi ${multiplier === 2 ? 'is-active' : ''}`}
            onClick={() => toggleMultiplier(2)}
          >
            <Icon src={doubleIcon} size="1.4rem" label="Double" />
          </button>
          <button
            type="button"
            className={`number-pad__btn number-pad__btn--multi ${multiplier === 3 ? 'is-active' : ''}`}
            onClick={() => toggleMultiplier(3)}
          >
            <Icon src={tripleIcon} size="1.4rem" label="Triple" />
          </button>
        </div>
        <button
          type="button"
          className="number-pad__btn number-pad__btn--undo"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Annuler"
        >
          ↺
        </button>
      </div>
    </div>
  )
}
