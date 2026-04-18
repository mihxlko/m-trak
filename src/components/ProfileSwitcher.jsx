import { useState, useEffect, useRef } from 'react'
import { getProfiles } from '../utils/storage.js'

function Avatar({ avatar, size = 'normal' }) {
  const [failed, setFailed] = useState(false)
  const cls = size === 'small' ? 'profile-avatar-small' : 'profile-avatar'

  if (!avatar || failed) {
    return <div className={cls} />
  }

  return (
    <div className={cls}>
      <img src={avatar} alt="" onError={() => setFailed(true)} />
    </div>
  )
}

export default function ProfileSwitcher({ activeProfileId, onSwitch, onClickOverride }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const profiles = getProfiles()
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0]

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

  function handleSelect(profileId) {
    onSwitch(profileId)
    setOpen(false)
  }

  function handleTriggerClick() {
    if (onClickOverride) {
      onClickOverride()
    } else {
      setOpen(o => !o)
    }
  }

  return (
    <div className="profile-switcher" ref={ref}>
      <div className="profile-switcher-trigger" onClick={handleTriggerClick}>
        <Avatar avatar={activeProfile.avatar} />
        <span className="profile-name">{activeProfile.displayName}</span>
        <svg className="profile-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="profile-dropdown">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="profile-dropdown-item"
              onClick={() => handleSelect(profile.id)}
            >
              <Avatar avatar={profile.avatar} size="small" />
              <span>{profile.displayName}</span>
              {profile.id === activeProfileId && (
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
