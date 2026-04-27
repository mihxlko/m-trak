import { useState, useEffect, useRef } from 'react'
import IconList from '../icons/icon-list.jsx'
import IconGrid from '../icons/icon-grid.jsx'
import IconBackArrow from '../icons/icon-back-arrow.jsx'
import IconForwardArrow from '../icons/icon-forward-arrow.jsx'

// Inline SVG matching Figma node 197:3318 — two adjacent panels (sidebar layout icon)
function SidebarToggleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 3.5 H5.5 V12.5 H4 C2.9 12.5 2 11.6 2 10.5 V5.5 C2 4.4 2.9 3.5 4 3.5 Z"
        stroke="currentColor" strokeWidth="1" fill="none"
      />
      <path
        d="M5.5 3.5 H12 C13.1 3.5 14 4.4 14 5.5 V10.5 C14 11.6 13.1 12.5 12 12.5 H5.5 V3.5 Z"
        stroke="currentColor" strokeWidth="1" fill="none"
      />
    </svg>
  )
}

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

function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn view-toggle-btn--left${viewMode === 'list' ? ' active' : ''}`}
        onClick={() => viewMode !== 'list' && onToggle()}
        title="List view"
      >
        <IconList />
      </button>
      <button
        className={`view-toggle-btn view-toggle-btn--right${viewMode === 'grid' ? ' active' : ''}`}
        onClick={() => viewMode !== 'grid' && onToggle()}
        title="Grid view"
      >
        <IconGrid />
      </button>
    </div>
  )
}

export default function TopBar({
  currentView,
  selectedMonth,
  selectedYear,
  selectedBoard,
  years,
  onYearChange,
  onNavigateToTimeline,
  onNavigateToBoards,
  viewMode,
  onToggleView,
  onToggleSidebar,
  canGoBack,
  canGoForward,
  onHistoryBack,
  onHistoryForward,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-nav-controls">
          <button className="topbar-sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
            <SidebarToggleIcon />
          </button>
          <button
            className="topbar-back-btn"
            onClick={onHistoryBack}
            disabled={!canGoBack}
            title="Go back"
          >
            <IconBackArrow />
          </button>
          <button
            className="topbar-forward-btn"
            onClick={onHistoryForward}
            disabled={!canGoForward}
            title="Go forward"
          >
            <IconForwardArrow />
          </button>
        </div>

        <div className="topbar-breadcrumb">
          {currentView === 'timeline' && (
            <span className="topbar-breadcrumb-current">Timeline</span>
          )}
          {currentView === 'month' && (
            <>
              <span className="topbar-breadcrumb-link" onClick={onNavigateToTimeline}>Timeline</span>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-breadcrumb-current">{selectedMonth}</span>
            </>
          )}
          {currentView === 'yourBoards' && (
            <span className="topbar-breadcrumb-current">Your Boards</span>
          )}
          {currentView === 'boardDetail' && (
            <>
              <span className="topbar-breadcrumb-link" onClick={onNavigateToBoards}>Your Boards</span>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-breadcrumb-current">{selectedBoard?.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-controls">
        <YearSwitcher years={years} selectedYear={selectedYear} onYearChange={onYearChange} />
        {(currentView === 'timeline' || currentView === 'yourBoards') && (
          <ViewToggle viewMode={viewMode} onToggle={onToggleView} />
        )}
      </div>
    </header>
  )
}
