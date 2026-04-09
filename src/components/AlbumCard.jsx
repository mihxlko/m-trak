import { useState, useRef, useEffect } from 'react'

function DotsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <circle cx="6" cy="1.5" r="1.2" />
      <circle cx="6" cy="6" r="1.2" />
      <circle cx="6" cy="10.5" r="1.2" />
    </svg>
  )
}

function DragIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
      <circle cx="2" cy="2" r="1.2" />
      <circle cx="6" cy="2" r="1.2" />
      <circle cx="2" cy="6" r="1.2" />
      <circle cx="6" cy="6" r="1.2" />
      <circle cx="2" cy="10" r="1.2" />
      <circle cx="6" cy="10" r="1.2" />
    </svg>
  )
}

export default function AlbumCard({ album, editMode, onFieldChange, onDelete, dragHandleProps }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKeyDown(e) { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      {!editMode && (
        <div className="album-drag-handle" {...dragHandleProps}>
          <DragIcon />
        </div>
      )}
      <div className="album-card">
        <div className="album-card-image" />
        <div className="album-card-fields">
          {editMode ? (
            <>
              <input
                className="album-card-input album-name-input"
                value={album.albumName}
                placeholder="Album Name..."
                onChange={e => onFieldChange(album.id, 'albumName', e.target.value)}
              />
              <input
                className="album-card-input artist-name-input"
                value={album.artistName}
                placeholder="Artist Name..."
                onChange={e => onFieldChange(album.id, 'artistName', e.target.value)}
              />
            </>
          ) : (
            <>
              <span className={`album-card-text album-name-text${!album.albumName ? ' muted' : ''}`}>
                {album.albumName || 'Album Name...'}
              </span>
              <span className={`album-card-text artist-name-text${!album.artistName ? ' muted' : ''}`}>
                {album.artistName || 'Artist Name...'}
              </span>
            </>
          )}
        </div>
        {!editMode && (
          <div className="album-card-menu" ref={menuRef}>
            <button
              className="album-card-menu-btn"
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            >
              <DotsIcon />
            </button>
            {menuOpen && (
              <div className="song-row-dropdown album-card-dropdown">
                <button
                  className="song-row-dropdown-item"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(album.id) }}
                >
                  Delete Album
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
