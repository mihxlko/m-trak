import { useState, useEffect } from 'react'
import { MONTHS } from '../utils/storage.js'

export default function NewMonthOverlay({ existingMonths, onDone, onCancel }) {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="overlay-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="overlay-modal overlay-modal--month">
        <div className="overlay-title">New Month</div>

        <div className="month-select-list">
          {MONTHS.map(month => {
            const isDisabled = existingMonths.includes(month)
            const isSelected = selected === month
            return (
              <div
                key={month}
                className={[
                  'month-select-item',
                  isSelected && 'month-select-item--selected',
                  isDisabled && 'month-select-item--disabled',
                ].filter(Boolean).join(' ')}
                onClick={() => { if (!isDisabled) setSelected(month) }}
              >
                {month}
              </div>
            )
          })}
        </div>

        <div className="overlay-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={() => onDone(selected)} disabled={!selected}>Done</button>
        </div>
      </div>
    </div>
  )
}
