import { useState, useEffect, useRef } from 'react'
import { getProfiles, getProfileInfo, getThemePreference, saveThemePreference, GUEST_PROFILE_ID } from '../utils/storage.js'

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#6B99F4"/>
      <path d="M8 5V11M5 8H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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

// ── Theme dropdown ─────────────────────────────────────────────────────────────

function ThemeDropdown({ activeProfileId }) {
  const [theme, setTheme] = useState(() => getThemePreference(activeProfileId))
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function selectTheme(t) {
    setTheme(t)
    saveThemePreference(activeProfileId, t)
    if (t === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
    setOpen(false)
  }

  const labels = { light: 'Light', dark: 'Dark', system: 'System' }
  const themeColor = { light: '#6B99F4', dark: '#8B7CF4', system: '#6B99F4' }

  return (
    <div className="settings-theme-dropdown-wrapper" ref={ref}>
      <button className="settings-theme-toggle" onClick={() => setOpen(o => !o)}>
        <div className="settings-theme-indicator">
          <div className="settings-theme-dot" style={{ background: themeColor[theme] }} />
          <span className="settings-theme-aa">Aa</span>
        </div>
        <span className="settings-theme-name">{labels[theme]}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="settings-theme-menu">
          {(['light', 'dark', 'system']).map(t => (
            <div
              key={t}
              className="settings-theme-menu-item"
              onClick={() => selectTheme(t)}
            >
              <span>{labels[t]}</span>
              {theme === t && <CheckIcon />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main overlay ───────────────────────────────────────────────────────────────

export default function SettingsOverlay({ activeProfileId, onClose, onShowToast }) {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0]
  const profileInfo = getProfileInfo(activeProfileId)
  const isGuest = activeProfileId === GUEST_PROFILE_ID

  const [guestAvatar, setGuestAvatar] = useState(() => sessionStorage.getItem('guestAvatar') || null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result
      sessionStorage.setItem('guestAvatar', base64)
      setGuestAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  const avatarSrc = isGuest ? (guestAvatar || profile.avatar) : profile.avatar

  function handleFeatureDisabled() {
    if (isGuest) return
    onShowToast('This feature is disabled in trial mode.')
  }

  return (
  <div className="settings-overlay-page">
    <div className="settings-modal">
      <div className="settings-overlay-header">
        <button className="settings-back-btn" onClick={onClose}>
          <ArrowLeftIcon />
          <span>BACK TO APP</span>
        </button>
        <div className="settings-esc-badge">ESC</div>
      </div>

      <div className="settings-overlay-content">
        <div className="settings-overlay-title">Settings</div>

        {/* Account */}
        <div className="settings-section-group">
          <div className="settings-section-title">Account</div>
          <div className="settings-account-body">
            <div className="settings-avatar-wrap">
              {avatarSrc ? (
                <img
                  className="settings-avatar-img"
                  src={avatarSrc}
                  alt=""
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="settings-avatar-placeholder" />
              )}
              {isGuest && (
                <>
                  <div
                    className="settings-avatar-edit-icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PlusCircleIcon />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>

            <div className="settings-display-name-field">
              <div className="settings-display-name-label">Display Name</div>
              <div className="settings-display-name-value">{profile.displayName}</div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="settings-section-group">
          <div className="settings-section-title">Account Security</div>
          <div className="settings-security-body">
            <div className="settings-security-row">
              <div className="settings-security-label-group">
                <span className="settings-security-label">Email</span>
                <span className="settings-security-sublabel">{profileInfo.email || 'Not set'}</span>
              </div>
              <button className="settings-action-btn" onClick={handleFeatureDisabled}>
                Change Email
              </button>
            </div>

            <div className="settings-security-row">
              <div className="settings-security-label-group">
                <span className="settings-security-label">Full Name</span>
                <span className="settings-security-sublabel">{profileInfo.fullName || 'Not set'}</span>
              </div>
              <button className="settings-action-btn" onClick={handleFeatureDisabled}>
                Change Full Name
              </button>
            </div>

            <div className="settings-security-row settings-security-row--last">
              <div className="settings-security-label-group">
                <span className="settings-security-label">Password</span>
                <span className="settings-security-sublabel">Set a password for your account</span>
              </div>
              <button className="settings-action-btn" onClick={handleFeatureDisabled}>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section-group">
          <div className="settings-section-title">Appearance</div>
          <div className="settings-appearance-body">
            <div className="settings-appearance-row">
              <div className="settings-security-label-group">
                <span className="settings-security-label">Interface Theme</span>
                <span className="settings-security-sublabel">Select or customize your color theme</span>
              </div>
              <ThemeDropdown activeProfileId={activeProfileId} />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section-group">
          <div className="settings-section-title">Danger Zone</div>
          <div className="settings-danger-body">
            <div className="settings-appearance-row">
              <div className="settings-security-label-group">
                <span className="settings-security-label">Delete my account</span>
                <span className="settings-security-sublabel">
                  Permanently delete this account, including boards and all other content
                </span>
              </div>
              <button className="settings-delete-account-btn" onClick={handleFeatureDisabled}>
                Delete my account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};