import { useState, useEffect, useRef } from 'react'
import ProfileSwitcher from './ProfileSwitcher.jsx'
import AccountDropdown from './AccountDropdown.jsx'

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2.5" width="12" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4.5 1V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9.5 1V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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

function PanelLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5" y1="1" x2="5" y2="15" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

function SidebarCreateMenu({ currentView, onCreateYear, onCreateMonth, onOpenBoardOverlay }) {
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

  const isTimeline = currentView === 'timeline' || currentView === 'month'

  return (
    <div className="create-menu-wrapper" ref={ref}>
      <button className="sidebar-create-btn" onClick={() => setOpen(o => !o)}>
        <PlusIcon />
        <span>Create</span>
      </button>
      {open && (
        <div className="create-dropdown">
          {isTimeline ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({
  activeProfileId,
  onSwitchProfile,
  currentView,
  onNavigateToTimeline,
  onNavigateToBoards,
  isOpen,
  onToggleSidebar,
  onOpenSettings,
  onShowToast,
  isOwner,
  onCreateYear,
  onCreateMonth,
  onOpenBoardOverlay,
}) {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const isTimelineActive = ['timeline', 'month'].includes(currentView)
  const isBoardsActive = ['yourBoards', 'boardDetail'].includes(currentView)

  return (
    <aside className={`sidebar${isOpen ? '' : ' sidebar-collapsed'}`}>
      <div className="sidebar-header" style={{ position: 'relative' }}>
        <ProfileSwitcher
          activeProfileId={activeProfileId}
          onSwitch={onSwitchProfile}
          onClickOverride={() => setShowAccountDropdown(o => !o)}
        />
        {showAccountDropdown && (
          <AccountDropdown
            activeProfileId={activeProfileId}
            onClose={() => setShowAccountDropdown(false)}
            onOpenSettings={() => { setShowAccountDropdown(false); onOpenSettings() }}
            onShowToast={onShowToast}
          />
        )}
        <button className="sidebar-icon-btn" onClick={onToggleSidebar} title="Collapse sidebar">
          <PanelLeftIcon />
        </button>
      </div>

      {isOwner && (
        <SidebarCreateMenu
          currentView={currentView}
          onCreateYear={onCreateYear}
          onCreateMonth={onCreateMonth}
          onOpenBoardOverlay={onOpenBoardOverlay}
        />
      )}

      <nav className="sidebar-nav">
        <div
          className={`sidebar-nav-item ${isTimelineActive ? 'active' : ''}`}
          onClick={onNavigateToTimeline}
        >
          <CalendarIcon />
          <span>Timeline</span>
        </div>
        <div
          className={`sidebar-nav-item ${isBoardsActive ? 'active' : ''}`}
          onClick={onNavigateToBoards}
        >
          <GridIcon />
          <span>Your Boards</span>
        </div>
      </nav>
    </aside>
  )
}
