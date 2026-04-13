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
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 5H12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M9 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function MonthIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 5H12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1V5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 4.5C1.5 3.95 1.95 3.5 2.5 3.5H5.5L6.5 4.5H10.5C11.05 4.5 11.5 4.95 11.5 5.5V10C11.5 10.55 11.05 11 10.5 11H2.5C1.95 11 1.5 10.55 1.5 10V4.5Z"
        stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="7.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1.5" y="7.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="7.5" y="7.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function TimelineCreateMenu({ onCreateYear, onCreateMonth }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onMouseDown)
      document.addEventListener('keydown', onKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="create-menu-wrapper" ref={ref}>
      <button className="btn" onClick={() => setOpen(o => !o)}>Create +</button>
      {open && (
        <div className="create-dropdown">
          <div
            className="create-dropdown-item"
            onClick={() => { setOpen(false); onCreateYear() }}
          >
            <CalendarIcon />
            <span>Year</span>
          </div>
          <div
            className="create-dropdown-item"
            onClick={() => { setOpen(false); onCreateMonth() }}
          >
            <MonthIcon />
            <span>Month</span>
          </div>
        </div>
      )}
    </div>
  )
}

function BoardsCreateMenu({ onOpenBoardOverlay }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onMouseDown)
      document.addEventListener('keydown', onKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="create-menu-wrapper" ref={ref}>
      <button className="btn" onClick={() => setOpen(o => !o)}>Create +</button>
      {open && (
        <div className="create-dropdown">
          <div className="create-dropdown-item create-dropdown-item--disabled">
            <FolderIcon />
            <span>Folder</span>
          </div>
          <div
            className="create-dropdown-item"
            onClick={() => { setOpen(false); onOpenBoardOverlay() }}
          >
            <BoardIcon />
            <span>Board</span>
          </div>
        </div>
      )}
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
  onOpenBoardOverlay,
  onCreateYear,
  onCreateMonth,
  onToggleSidebar,
  sidebarOpen,
  isOwner,
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
        {isOwner && currentView === 'timeline' && (
          <TimelineCreateMenu onCreateYear={onCreateYear} onCreateMonth={onCreateMonth} />
        )}
        {isOwner && currentView === 'yourBoards' && (
          <BoardsCreateMenu onOpenBoardOverlay={onOpenBoardOverlay} />
        )}
        <YearSwitcher years={years} selectedYear={selectedYear} onYearChange={onYearChange} />
        <button
          className="icon-btn"
          title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          onClick={onToggleView}
        >
          {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
        </button>
      </div>
    </header>
  )
}
