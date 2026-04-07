import { useState, useEffect, useRef } from 'react'

export default function MonthCard({ month, monthData, onCardClick, onCoverChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const menuRef = useRef(null)
  const hasSongs = monthData.songs && monthData.songs.length > 0

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleMenuClick(e) {
    e.stopPropagation()
    setMenuOpen(o => !o)
  }

  function handleAddPhoto(e) {
    e.stopPropagation()
    setMenuOpen(false)
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      onCoverChange(month, evt.target.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="month-card" onClick={onCardClick}>
      <div className="month-card-image-area">
        {monthData.coverImage && (
          <img src={monthData.coverImage} alt={month} />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="month-card-footer">
        <div className="month-card-name-row">
          <span>{month}</span>
          {hasSongs && <span className="month-dot" />}
        </div>

        <div className="month-card-menu-wrapper" ref={menuRef}>
          <span className="month-card-menu" onClick={handleMenuClick}>⋯</span>
          {menuOpen && (
            <div className="month-card-dropdown">
              <div className="month-card-dropdown-item" onClick={handleAddPhoto}>
                Add photo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
