import { useState, useEffect, useRef } from 'react'
import { getProfiles, getProfileInfo, GUEST_PROFILE_ID } from '../utils/storage.js'

function SmallPlusIcon() {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
      <path d="M3 1V5M1 3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function AccountDropdown({ activeProfileId, onClose, onOpenSettings, onShowToast, onSwitchProfile }) {
  const ref = useRef(null)
  const [downloadTooltipVisible, setDownloadTooltipVisible] = useState(false)
  const tooltipTimerRef = useRef(null)

  const profiles = getProfiles()
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0]
  const profileInfo = getProfileInfo(activeProfileId)
  const otherProfiles = profiles.filter(p => p.id !== activeProfileId)
  const isGuest = activeProfileId === GUEST_PROFILE_ID

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  function handleDownloadMouseEnter() {
    tooltipTimerRef.current = setTimeout(() => setDownloadTooltipVisible(true), 300)
  }

  function handleDownloadMouseLeave() {
    clearTimeout(tooltipTimerRef.current)
    setDownloadTooltipVisible(false)
  }

  function handleDisabledFeature() {
    if (isGuest) return
    onShowToast('This feature is disabled in trial mode.')
    onClose()
  }

  return (
    <div className="account-dropdown-wrapper" ref={ref}>
      <div className="account-dropdown">

        {/* Current profile header */}
        <div className="account-dropdown-profile">
          <div className="account-dropdown-avatar">
            {activeProfile.avatar && (
              <img src={activeProfile.avatar} alt="" onError={e => { e.target.style.display = 'none' }} />
            )}
          </div>
          <div className="account-dropdown-profile-info">
            <div className="account-dropdown-name">{activeProfile.displayName}</div>
            {profileInfo.email && (
              <div className="account-dropdown-email">{profileInfo.email}</div>
            )}
          </div>
        </div>

        {/* Other accounts */}
        <div className="account-dropdown-accounts">
          {otherProfiles.map(p => {
            const isGuest = p.id === GUEST_PROFILE_ID
            return (
              <div key={p.id} className="account-dropdown-account-item" onClick={() => onSwitchProfile(p.id)}>
                {isGuest ? (
                  <div className="account-dropdown-gradient-avatar">
                    <span className="account-dropdown-gradient-initials">AS</span>
                  </div>
                ) : (
                  <div className="account-dropdown-avatar-sm">
                    {p.avatar && <img src={p.avatar} alt="" onError={e => { e.target.style.display = 'none' }} />}
                  </div>
                )}
                <span className="account-dropdown-account-name">{p.displayName}</span>
              </div>
            )
          })}
          <div className="account-dropdown-account-item" onClick={handleDisabledFeature}>
            <div className="account-dropdown-add-icon">
              <SmallPlusIcon />
            </div>
            <span className="account-dropdown-add-text">Add Account</span>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="account-dropdown-bottom">
          <button className="account-dropdown-item" onClick={onOpenSettings}>
            Settings
          </button>
          <button
            className="account-dropdown-item"
            onMouseEnter={handleDownloadMouseEnter}
            onMouseLeave={handleDownloadMouseLeave}
          >
            Download desktop app
            {downloadTooltipVisible && (
              <div className="account-dropdown-tooltip">Coming Soon</div>
            )}
          </button>
          <button className="account-dropdown-item" onClick={handleDisabledFeature}>
            Log Out
          </button>
        </div>

      </div>
    </div>
  )
}
