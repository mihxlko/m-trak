import { useState, useRef, useEffect } from 'react'
import { searchAlbums } from '../utils/musicApi.js'
import { debounce } from '../utils/debounce.js'
import SearchDropdown from './SearchDropdown.jsx'
import Icon3DotVerticalSettings from '../icons/icon-3-dot-vertical-settings.jsx'

const ADD_ALBUM_ART_LABEL = 'Add Album Art'

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

export default function AlbumCard({ album, editMode, onFieldChange, onSelectResult, onDelete, onAlbumArtChange, dragHandleProps, focusIdRef }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const albumArtInputRef = useRef(null)

  const [searchResults, setSearchResults] = useState([])
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = useRef(null)

  const debouncedSearch = useRef(debounce(async (query) => {
    if (query.length < 2) { setSearchResults([]); setDropdownVisible(false); return }
    const results = await searchAlbums(query)
    setSearchResults(results)
    setDropdownVisible(results.length > 0)
  }, 300)).current

  function handleAlbumNameChange(e) {
    const val = e.target.value
    onFieldChange(album.id, 'albumName', val)
    debouncedSearch(val)
  }

  function handleAlbumNameBlur() {
    setTimeout(() => setDropdownVisible(false), 150)
  }

  function handleAlbumNameKeyDown(e) {
    dropdownRef.current?.handleKeyDown(e)
  }

  function handleSelect(result) {
    onSelectResult(album.id, result)
    setDropdownVisible(false)
    setSearchResults([])
  }

  function handleAlbumArtFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
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
        onAlbumArtChange(album.id, canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => onAlbumArtChange(album.id, evt.target.result)
      img.src = evt.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

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
        <div className="album-card-image">
          {album.coverUrl && (
            <img src={album.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
        <div className="album-card-footer">
          <div className="album-card-fields">
            {editMode ? (
              <>
                <div style={{ position: 'relative' }}>
                  <input
                    className="album-card-input album-name-input"
                    value={album.albumName}
                    placeholder="Album Name..."
                    onChange={handleAlbumNameChange}
                    onBlur={handleAlbumNameBlur}
                    onKeyDown={handleAlbumNameKeyDown}
                    ref={el => {
                      if (el && focusIdRef?.current === album.id) {
                        el.focus()
                        focusIdRef.current = null
                      }
                    }}
                  />
                  <SearchDropdown
                    ref={dropdownRef}
                    results={searchResults}
                    visible={dropdownVisible}
                    onSelect={handleSelect}
                    onDismiss={() => setDropdownVisible(false)}
                  />
                </div>
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
                <Icon3DotVerticalSettings />
              </button>
              {menuOpen && (
                <div className="song-row-dropdown album-card-dropdown">
                  <button
                    className="song-row-dropdown-item"
                    onMouseDown={e => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      albumArtInputRef.current?.click()
                    }}
                  >
                    {ADD_ALBUM_ART_LABEL}
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    className="song-row-dropdown-item song-row-dropdown-item--danger"
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
      </div>
      <input
        ref={albumArtInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAlbumArtFileChange}
      />
    </>
  )
}
