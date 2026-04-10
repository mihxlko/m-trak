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

export default function Sidebar({ activeProfileId, onSwitchProfile, currentView, onNavigateToTimeline, onNavigateToBoards, isOpen }) {
  const isTimelineActive = ['timeline', 'month'].includes(currentView)
  const isBoardsActive = ['yourBoards', 'boardDetail'].includes(currentView)

  return (
    <aside className={`sidebar${isOpen ? '' : ' sidebar-collapsed'}`}>
      <ProfileSwitcher activeProfileId={activeProfileId} onSwitch={onSwitchProfile} />

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
