import { useState, useEffect, useRef } from 'react'

function YearSwitcher({ years, selectedYear, onYearChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return (
    <div className="year-switcher" ref={ref}>
      <div className="year-switcher-trigger" onClick={() => setOpen(o => !o)}>
        <span>{selectedYear}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="year-dropdown">
          {years.map(year => (
            <div
              key={year}
              className="year-dropdown-item"
              onClick={() => { onYearChange(year); setOpen(false) }}
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
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <rect x="0.5" y="0.5" width="3" height="3" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="0.5" y="5.5" width="3" height="3" rx="1" stroke="currentColor" strokeWidth="1"/>
      <line x1="5" y1="2" x2="8.5" y2="2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="5" y1="7" x2="8.5" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <rect x="0.5" y="0.5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="5" y="0.5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="0.5" y="5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="5" y="5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1"/>
    </svg>
  )
}

function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn view-toggle-btn--left${viewMode === 'list' ? ' active' : ''}`}
        onClick={() => viewMode !== 'list' && onToggle()}
        title="List view"
      >
        <ListIcon />
      </button>
      <button
        className={`view-toggle-btn view-toggle-btn--right${viewMode === 'grid' ? ' active' : ''}`}
        onClick={() => viewMode !== 'grid' && onToggle()}
        title="Grid view"
      >
        <GridIcon />
      </button>
    </div>
  )
}

function PanelLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5" y1="1" x2="5" y2="15" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

export default function TopBar({
  currentView,
  selectedMonth,
  selectedYear,
  selectedBoard,
  years,
  onYearChange,
  onNavigateBack,
  viewMode,
  onToggleView,
  onToggleSidebar,
  sidebarOpen,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {!sidebarOpen && (
          <button className="sidebar-toggle-btn" onClick={onToggleSidebar} title="Open sidebar">
            <PanelLeftIcon />
          </button>
        )}
        <div className="topbar-breadcrumb">
        {currentView === 'timeline' && (
          <span className="topbar-breadcrumb-current">Timeline</span>
        )}
        {currentView === 'month' && (
          <>
            <span className="topbar-breadcrumb-link" onClick={onNavigateBack}>Timeline</span>
            <span className="topbar-breadcrumb-sep">›</span>
            <span className="topbar-breadcrumb-current">{selectedMonth}</span>
          </>
        )}
        {currentView === 'yourBoards' && (
          <span className="topbar-breadcrumb-current">Your Boards</span>
        )}
        {currentView === 'boardDetail' && (
          <>
            <span className="topbar-breadcrumb-link" onClick={onNavigateBack}>Your Boards</span>
            <span className="topbar-breadcrumb-sep">›</span>
            <span className="topbar-breadcrumb-current">{selectedBoard?.name}</span>
          </>
        )}
        </div>
      </div>

      <div className="topbar-controls">
        <YearSwitcher years={years} selectedYear={selectedYear} onYearChange={onYearChange} />
        <ViewToggle viewMode={viewMode} onToggle={onToggleView} />
      </div>
    </header>
  )
}
