import { useState, useEffect, useRef } from 'react'

export default function MonthCard({ month, monthData, onCardClick, onCoverChange, onRemove, isOwner }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const menuRef = useRef(null)
  const hasContent = Array.isArray(monthData.blocks)
    ? monthData.blocks.some(b => b.items?.length > 0)
    : (monthData.songs?.length > 0)

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

  function handleRemoveClick(e) {
    e.stopPropagation()
    setMenuOpen(false)
    onRemove?.(month)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      const dataUrl = evt.target.result
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        onCoverChange(month, canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => onCoverChange(month, dataUrl)
      img.src = dataUrl
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
          <span className={hasContent ? 'month-card-name--has-content' : 'month-card-name--empty'}>{month}</span>
        </div>

        {isOwner && (
          <div className="month-card-menu-wrapper" ref={menuRef}>
            <span className="month-card-menu" onClick={handleMenuClick}>⋯</span>
            {menuOpen && (
              <div className="month-card-dropdown">
                <div className="month-card-dropdown-item" onClick={handleAddPhoto}>
                  Add photo
                </div>
                <div className="month-card-dropdown-divider" />
                <div className="month-card-dropdown-item month-card-dropdown-item--danger" onClick={handleRemoveClick}>
                  Remove board
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
