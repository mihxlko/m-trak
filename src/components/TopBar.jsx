import { useState, useEffect, useRef } from 'react'

const YEARS = ['2025', '2026']

function YearSwitcher({ selectedYear, onYearChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelect(year) {
    onYearChange(year)
    setOpen(false)
  }

  return (
    <div className="year-switcher" ref={ref}>
      <div className="year-switcher-trigger" onClick={() => setOpen(o => !o)}>
        <span>{selectedYear}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="year-dropdown">
          {YEARS.map(year => (
            <div
              key={year}
              className="year-dropdown-item"
              onClick={() => handleSelect(year)}
            >
              <span>{year}</span>
              {year === selectedYear && (
                <svg className="check-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="7" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="1" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

export default function TopBar({ currentView, selectedMonth, selectedYear, onYearChange, onNavigateBack, viewMode, onToggleView }) {
  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        {currentView === 'timeline' ? (
          <span className="topbar-breadcrumb-current">Timeline</span>
        ) : (
          <>
            <span className="topbar-breadcrumb-link" onClick={onNavigateBack}>Timeline</span>
            <span className="topbar-breadcrumb-sep">›</span>
            <span className="topbar-breadcrumb-current">{selectedMonth}</span>
          </>
        )}
      </div>

      <div className="topbar-controls">
        <YearSwitcher selectedYear={selectedYear} onYearChange={onYearChange} />

        <button className="icon-btn" title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'} onClick={onToggleView}>
          {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
        </button>
      </div>
    </header>
  )
}
