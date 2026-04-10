import ProfileSwitcher from './ProfileSwitcher.jsx'

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

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M12.6 3.4l-.85.85M4.25 11.75l-.85.85" />
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

export default function Sidebar({ activeProfileId, onSwitchProfile, currentView, onNavigateToTimeline, onNavigateToBoards, isOpen, onToggleSidebar, onOpenSettings }) {
  const isTimelineActive = ['timeline', 'month'].includes(currentView)
  const isBoardsActive = ['yourBoards', 'boardDetail'].includes(currentView)

  return (
    <aside className={`sidebar${isOpen ? '' : ' sidebar-collapsed'}`}>
      <div className="sidebar-header">
        <ProfileSwitcher activeProfileId={activeProfileId} onSwitch={onSwitchProfile} />
        <div className="sidebar-header-actions">
          <button className="sidebar-icon-btn" onClick={onOpenSettings} title="Settings">
            <SettingsIcon />
          </button>
          <button className="sidebar-icon-btn" onClick={onToggleSidebar} title="Collapse sidebar">
            <PanelLeftIcon />
          </button>
        </div>
      </div>

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
