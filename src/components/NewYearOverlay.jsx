import { useState, useEffect } from 'react'

export default function NewYearOverlay({ existingYears, onDone, onCancel }) {
  const [value, setValue] = useState('')
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  const num = Number(value)
  const is4Digits = value.length === 4
  const alreadyExists = is4Digits && existingYears.includes(value)
  const isFuture = is4Digits && num > currentYear
  const tooSmall = is4Digits && num < 1000
  const canSubmit = is4Digits && !alreadyExists && !isFuture && !tooSmall

  const errorMessage = is4Digits
    ? alreadyExists ? 'This year already exists.'
      : isFuture ? "This year hasn't happened yet!"
      : null
    : null

  function handleChange(e) {
    const filtered = e.target.value.replace(/\D/g, '').slice(0, 4)
    setValue(filtered)
  }

  function handleInputKeyDown(e) {
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    if (e.key === 'Enter' && canSubmit) { onDone(value); return }
    if (!/^\d$/.test(e.key)) e.preventDefault()
  }

  return (
    <div className="overlay-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="overlay-modal">
        <div className="overlay-title">New Year</div>

        <div className="overlay-year-input-wrapper">
          <input
            className="overlay-year-input"
            type="text"
            inputMode="numeric"
            value={value}
            placeholder={String(currentYear - 1)}
            onChange={handleChange}
            onKeyDown={handleInputKeyDown}
            autoFocus
            maxLength={4}
          />
          {errorMessage && (
            <div className="overlay-error">{errorMessage}</div>
          )}
        </div>

        <div className="overlay-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={() => onDone(value)} disabled={!canSubmit}>Done</button>
        </div>
      </div>
    </div>
  )
}
