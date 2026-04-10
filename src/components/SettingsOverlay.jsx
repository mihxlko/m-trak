import { useState, useEffect, useRef } from 'react'
import { getProfiles, getProfileInfo, saveProfileInfo, getThemePreference, saveThemePreference } from '../utils/storage.js'

// ── Icons ─────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="3" x2="11" y2="11" />
      <line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M1.5 12.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="2.5" />
      <line x1="7" y1="1" x2="7" y2="2.5" />
      <line x1="7" y1="11.5" x2="7" y2="13" />
      <line x1="1" y1="7" x2="2.5" y2="7" />
      <line x1="11.5" y1="7" x2="13" y2="7" />
      <line x1="2.93" y1="2.93" x2="4.06" y2="4.06" />
      <line x1="9.94" y1="9.94" x2="11.07" y2="11.07" />
      <line x1="11.07" y1="2.93" x2="9.94" y2="4.06" />
      <line x1="4.06" y1="9.94" x2="2.93" y2="11.07" />
    </svg>
  )
}

function KeyboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3.5" width="12" height="7" rx="1.5" />
      <line x1="3.5" y1="6.5" x2="3.5" y2="6.5" strokeWidth="1.5" />
      <line x1="6" y1="6.5" x2="6" y2="6.5" strokeWidth="1.5" />
      <line x1="8.5" y1="6.5" x2="8.5" y2="6.5" strokeWidth="1.5" />
      <line x1="11" y1="6.5" x2="11" y2="6.5" strokeWidth="1.5" />
      <line x1="4" y1="8.5" x2="10" y2="8.5" strokeWidth="1.5" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" />
      <polyline points="9 10 13 7 9 4" />
      <line x1="13" y1="7" x2="5" y2="7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5 5 4 7.5 8.5 2.5" />
    </svg>
  )
}

// ── Theme preview illustrations ───────────────────────────────────────────────

function LightPreview() {
  return (
    <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
      <rect width="72" height="48" rx="4" fill="#F3F3F2" />
      <rect x="1" y="1" width="18" height="46" rx="3" fill="#E8E6E5" />
      <rect x="22" y="6" width="44" height="7" rx="2" fill="#E8E6E5" />
      <rect x="22" y="17" width="44" height="24" rx="2" fill="#FDFDFD" />
    </svg>
  )
}

function DarkPreview() {
  return (
    <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
      <rect width="72" height="48" rx="4" fill="#09090b" />
      <rect x="1" y="1" width="18" height="46" rx="3" fill="#18181b" />
      <rect x="22" y="6" width="44" height="7" rx="2" fill="#27272a" />
      <rect x="22" y="17" width="44" height="24" rx="2" fill="#27272a" />
    </svg>
  )
}

function SystemPreview() {
  return (
    <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
      <defs>
        <clipPath id="sys-preview-clip">
          <rect width="72" height="48" rx="4" />
        </clipPath>
      </defs>
      <g clipPath="url(#sys-preview-clip)">
        <rect x="0" y="0" width="36" height="48" fill="#F3F3F2" />
        <rect x="36" y="0" width="36" height="48" fill="#09090b" />
        <rect x="1" y="1" width="11" height="46" rx="2" fill="#E8E6E5" />
        <rect x="37" y="1" width="11" height="46" fill="#18181b" />
        <rect x="15" y="5" width="19" height="5" rx="1.5" fill="#E8E6E5" />
        <rect x="15" y="15" width="19" height="27" rx="1.5" fill="#FDFDFD" />
        <rect x="51" y="5" width="19" height="5" rx="1.5" fill="#27272a" />
        <rect x="51" y="15" width="19" height="27" rx="1.5" fill="#27272a" />
      </g>
    </svg>
  )
}

// ── Pages ─────────────────────────────────────────────────────────────────────

function ProfilePage({ activeProfileId }) {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0]
  const [info, setInfo] = useState(() => getProfileInfo(activeProfileId))
  const emailRef = useRef(null)
  const [emailEditing, setEmailEditing] = useState(false)
  const savedEmailRef = useRef(info.email)

  function handleEmailFocus() {
    savedEmailRef.current = emailRef.current.innerText
    setEmailEditing(true)
  }

  function handleEmailBlur() {
    const val = emailRef.current.innerText.trim()
    setEmailEditing(false)
    const newInfo = { ...info, email: val || savedEmailRef.current }
    setInfo(newInfo)
    saveProfileInfo(activeProfileId, newInfo)
  }

  function handleEmailKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); emailRef.current.blur() }
    if (e.key === 'Escape') { emailRef.current.innerText = savedEmailRef.current; emailRef.current.blur() }
  }

  function handleBirthdayChange(field, value) {
    const newInfo = { ...info, birthday: { ...info.birthday, [field]: value } }
    setInfo(newInfo)
    saveProfileInfo(activeProfileId, newInfo)
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm('Are you sure? This will delete all data for this profile. This cannot be undone.')
    if (!confirmed) return
    localStorage.removeItem(`m-trakData_${activeProfileId}`)
    localStorage.removeItem(`aulosProfile_${activeProfileId}`)
    window.location.reload()
  }

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h2 className="settings-page-title">Profile</h2>
        <p className="settings-page-subtitle">Manage your profile</p>
        <div className="settings-divider" />
      </div>

      <div className="settings-profile-card">
        <div className="settings-profile-avatar">
          {profile.avatar && <img src={profile.avatar} alt="" onError={e => { e.target.style.display = 'none' }} />}
        </div>
        <div className="settings-profile-name">{profile.displayName}</div>
        <span
          ref={emailRef}
          className={`settings-profile-email${emailEditing ? ' editing' : ''}`}
          contentEditable="true"
          suppressContentEditableWarning
          onFocus={handleEmailFocus}
          onBlur={handleEmailBlur}
          onKeyDown={handleEmailKeyDown}
          dangerouslySetInnerHTML={{ __html: info.email || '' }}
          data-placeholder="Add email..."
        />
      </div>

      <div className="settings-section">
        <div className="settings-section-label">Birthday</div>
        <div className="settings-section-sublabel">Only day and month will be visible.</div>
        <div className="settings-birthday-row">
          <input
            className="settings-input"
            placeholder="eg. March"
            value={info.birthday?.month || ''}
            onChange={e => handleBirthdayChange('month', e.target.value)}
          />
          <input
            className="settings-input settings-input-day"
            type="number"
            placeholder="1–31"
            min="1"
            max="31"
            value={info.birthday?.day || ''}
            onChange={e => handleBirthdayChange('day', e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section settings-danger-section">
        <div className="settings-section-label settings-danger-label">Danger zone</div>
        <div className="settings-section-sublabel">Delete your account and all your data.</div>
        <button className="settings-delete-btn" onClick={handleDeleteAccount}>Delete account</button>
      </div>
    </div>
  )
}

function AppearancePage({ activeProfileId }) {
  const [theme, setTheme] = useState(() => getThemePreference(activeProfileId))

  function selectTheme(t) {
    setTheme(t)
    saveThemePreference(activeProfileId, t)
    if (t === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  const themes = [
    { id: 'light', label: 'Light', Preview: LightPreview },
    { id: 'dark', label: 'Dark', Preview: DarkPreview },
    { id: 'system', label: 'System', Preview: SystemPreview },
  ]

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h2 className="settings-page-title">Appearance</h2>
        <p className="settings-page-subtitle">Customize how m-trak looks and feels</p>
        <div className="settings-divider" />
      </div>

      <div className="settings-section">
        <div className="settings-section-label">Theme</div>
        <div className="settings-section-sublabel">Select your preferred theme</div>
        <div className="settings-theme-cards">
          {themes.map(({ id, label, Preview }) => (
            <button
              key={id}
              className={`settings-theme-card${theme === id ? ' selected' : ''}`}
              onClick={() => selectTheme(id)}
            >
              {theme === id && (
                <div className="settings-theme-check"><CheckIcon /></div>
              )}
              <Preview />
              <span className="settings-theme-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShortcutsPage() {
  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h2 className="settings-page-title">Shortcuts</h2>
        <p className="settings-page-subtitle">Keyboard shortcuts to help you work faster</p>
        <div className="settings-divider" />
      </div>

      <div className="settings-section-header-label">Boards</div>

      <div className="settings-shortcut-row">
        <span className="settings-shortcut-name">Create Block</span>
        <div className="settings-shortcut-keys">
          <span className="settings-key-badge">⌘</span>
          <span className="settings-key-badge">T</span>
        </div>
      </div>
    </div>
  )
}

// ── Main overlay ──────────────────────────────────────────────────────────────

export default function SettingsOverlay({ activeProfileId, onClose }) {
  const [activePage, setActivePage] = useState('profile')
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0]
  const profileInfo = getProfileInfo(activeProfileId)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleSignOut() {
    localStorage.removeItem('m-trakActiveProfile')
    window.location.reload()
  }

  function handleBackdropMouseDown(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const navItems = [
    { id: 'profile', label: 'Profile', Icon: PersonIcon },
    { id: 'appearance', label: 'Appearance', Icon: SunIcon },
    { id: 'shortcuts', label: 'Shortcuts', Icon: KeyboardIcon },
  ]

  return (
    <div className="settings-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div className="settings-container">
        <button className="settings-close-btn" onClick={onClose}>
          <XIcon />
          <span className="settings-close-esc">ESC</span>
        </button>

        <div className="settings-left-panel">
          <div className="settings-left-profile">
            <div className="settings-left-avatar">
              {profile.avatar && <img src={profile.avatar} alt="" onError={e => { e.target.style.display = 'none' }} />}
            </div>
            <div className="settings-left-profile-info">
              <span className="settings-left-name">{profile.displayName}</span>
              {profileInfo.email && (
                <span className="settings-left-email">{profileInfo.email}</span>
              )}
            </div>
          </div>

          <nav className="settings-nav">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`settings-nav-item${activePage === id ? ' active' : ''}`}
                onClick={() => setActivePage(id)}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          <button className="settings-nav-item settings-signout" onClick={handleSignOut}>
            <SignOutIcon />
            Sign out
          </button>
        </div>

        <div className="settings-right-panel">
          {activePage === 'profile' && <ProfilePage activeProfileId={activeProfileId} />}
          {activePage === 'appearance' && <AppearancePage activeProfileId={activeProfileId} />}
          {activePage === 'shortcuts' && <ShortcutsPage />}
        </div>
      </div>
    </div>
  )
}
