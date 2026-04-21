import { useState, useRef, useEffect } from 'react'
import { searchTracks } from '../utils/musicApi.js'
import { debounce } from '../utils/debounce.js'
import SearchDropdown from './SearchDropdown.jsx'

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

function DotsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <circle cx="6" cy="1.5" r="1.2" />
      <circle cx="6" cy="6" r="1.2" />
      <circle cx="6" cy="10.5" r="1.2" />
    </svg>
  )
}

function SmallPlusIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="1" x2="4" y2="7" />
      <line x1="1" y1="4" x2="7" y2="4" />
    </svg>
  )
}

function uuid() {
  return crypto.randomUUID()
}

function makeBlankSong() {
  return { id: uuid(), track: '', artist: '', album: '', albumArt: null }
}

function TrackInputCell({ song, onFieldChange, onSelectResult, onBlurRow, autoFocusRef }) {
  const [searchResults, setSearchResults] = useState([])
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = useRef(null)

  const debouncedSearch = useRef(debounce(async (query) => {
    if (query.length < 2) { setSearchResults([]); setDropdownVisible(false); return }
    const results = await searchTracks(query)
    setSearchResults(results)
    setDropdownVisible(results.length > 0)
  }, 300)).current

  function handleChange(e) {
    const val = e.target.value
    onFieldChange(song.id, 'track', val)
    debouncedSearch(val)
  }

  function handleBlur() {
    setTimeout(() => {
      setDropdownVisible(false)
      onBlurRow(song.id)
    }, 150)
  }

  function handleKeyDown(e) {
    dropdownRef.current?.handleKeyDown(e)
  }

  function handleSelect(result) {
    onSelectResult(song.id, result)
    setDropdownVisible(false)
    setSearchResults([])
  }

  return (
    <div className="song-track-cell">
      <input
        className="song-input"
        value={song.track}
        placeholder="Track Name..."
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        ref={el => {
          if (el && autoFocusRef?.current === song.id) {
            el.focus()
            autoFocusRef.current = null
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
  )
}


export default function SongTable({ songs, editMode, onSongsChange, onViewSongsChange, initialFocusId }) {
  // Local songs state for immediate UI feedback while saves propagate
  const [localSongs, setLocalSongs] = useState(songs)

  // Resync from props when song structure changes (different IDs or count)
  const lastExternalIds = useRef(songs.map(s => s.id).join(','))
  const currentExternalIds = songs.map(s => s.id).join(',')
  if (currentExternalIds !== lastExternalIds.current) {
    lastExternalIds.current = currentExternalIds
    setLocalSongs(songs)
  }

  // Always-fresh ref so blur/timeout callbacks see current songs
  const localSongsRef = useRef(localSongs)
  localSongsRef.current = localSongs

  const [dragIds, setDragIds] = useState(new Set())
  const [dropTargetId, setDropTargetId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const [openMenuId, setOpenMenuId] = useState(null)
  const tableRef = useRef(null)
  const focusTrackIdRef = useRef(initialFocusId || null)

  // Click outside table: close menu
  useEffect(() => {
    function onMouseDown(e) {
      if (!tableRef.current) return
      if (!tableRef.current.contains(e.target)) {
        setOpenMenuId(null)
      } else if (!e.target.closest('.song-row-menu')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Escape: close menu
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Drag and drop ────────────────────────────────────────────────────────
  function handleDragStart(e, song) {
    const ids = new Set([song.id])
    setDragIds(ids)
    e.dataTransfer.effectAllowed = 'move'
    const rowEl = e.currentTarget.closest('.song-row')
    if (rowEl) {
      const rect = rowEl.getBoundingClientRect()
      e.dataTransfer.setDragImage(rowEl, e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  function handleDragEnd() {
    setDragIds(new Set())
    setDropTargetId(null)
    setDropBefore(true)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rows = tableRef.current?.querySelectorAll('.song-row')
    if (!rows?.length) return
    let found = false
    for (const row of rows) {
      const rect = row.getBoundingClientRect()
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mid = rect.top + rect.height / 2
        setDropTargetId(row.dataset.songId)
        setDropBefore(e.clientY < mid)
        found = true
        break
      }
    }
    if (!found) {
      const lastRect = rows[rows.length - 1].getBoundingClientRect()
      if (e.clientY > lastRect.bottom) {
        setDropTargetId(rows[rows.length - 1].dataset.songId)
        setDropBefore(false)
      }
    }
  }

  function handleDragLeave(e) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
      setDropTargetId(null)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    if (!dropTargetId || dragIds.size === 0) {
      setDragIds(new Set())
      setDropTargetId(null)
      return
    }
    const dragged = localSongs.filter(s => dragIds.has(s.id))
    const rest = localSongs.filter(s => !dragIds.has(s.id))
    const targetIdx = rest.findIndex(s => s.id === dropTargetId)
    const insertAt = targetIdx === -1 ? rest.length : dropBefore ? targetIdx : targetIdx + 1
    const newSongs = [...rest]
    newSongs.splice(insertAt, 0, ...dragged)
    setLocalSongs(newSongs)
    onViewSongsChange(newSongs)
    setDragIds(new Set())
    setDropTargetId(null)
  }

  // ── Removal ──────────────────────────────────────────────────────────────
  function handleRemove(songId) {
    const next = localSongs.filter(s => s.id !== songId)
    setLocalSongs(next)
    setOpenMenuId(null)
    onViewSongsChange(next)
  }

  // ── Field changes ────────────────────────────────────────────────────────
  function handleFieldChange(id, field, value) {
    const next = localSongs.map(s => s.id === id ? { ...s, [field]: value } : s)
    setLocalSongs(next)
    onSongsChange(next)
  }

  function handleSelectResult(songId, result) {
    const next = localSongs.map(s => s.id === songId
      ? { ...s, track: result.name, artist: result.artist, album: result.album || '' }
      : s
    )
    setLocalSongs(next)
    onSongsChange(next)
  }

  // ── Empty row cleanup on blur ────────────────────────────────────────────
  function handleRowBlur(songId) {
    const current = localSongsRef.current
    const song = current.find(s => s.id === songId)
    if (!song) return
    if (song.track.trim() === '' && song.artist.trim() === '' && song.album.trim() === '') {
      const next = current.filter(s => s.id !== songId)
      setLocalSongs(next)
      onSongsChange(next)
    }
  }

  function handleAddTrack() {
    const blank = makeBlankSong()
    focusTrackIdRef.current = blank.id
    const next = [...localSongs, blank]
    setLocalSongs(next)
    onSongsChange(next)
  }

  return (
    <div className="song-table" ref={tableRef}>
      <div className="song-table-header">
        <span>#</span>
        <span />
        <span>Track</span>
        <span>Artist</span>
        <span>Album</span>
        <span />
      </div>

      <div
        className="song-table-rows"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {localSongs.map((song, idx) => {
          const isDragging = dragIds.has(song.id)
          const isDropTarget = dropTargetId === song.id
          const menuOpen = openMenuId === song.id

          const rowClass = [
            'song-row',
            isDragging && 'dragging',
            isDropTarget && dropBefore && 'drop-before',
            isDropTarget && !dropBefore && 'drop-after',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={song.id}
              data-song-id={song.id}
              className={rowClass}
            >
              <div className="song-num-cell">
                <span className="song-row-num">{String(idx + 1).padStart(2, '0')}</span>
                <span
                  className="song-drag-handle"
                  draggable
                  onDragStart={e => handleDragStart(e, song)}
                  onDragEnd={handleDragEnd}
                >
                  <DragIcon />
                </span>
              </div>

              <div className="song-row-art">
                {song.albumArt && <img src={song.albumArt} alt="" />}
              </div>

              <TrackInputCell
                song={song}
                onFieldChange={handleFieldChange}
                onSelectResult={handleSelectResult}
                onBlurRow={handleRowBlur}
                autoFocusRef={focusTrackIdRef}
              />
              <input
                className="song-input"
                value={song.artist}
                placeholder="Artist Name..."
                onChange={e => handleFieldChange(song.id, 'artist', e.target.value)}
                onBlur={() => handleRowBlur(song.id)}
              />
              <input
                className="song-input"
                value={song.album}
                placeholder="Album Name..."
                onChange={e => handleFieldChange(song.id, 'album', e.target.value)}
                onBlur={() => handleRowBlur(song.id)}
              />

              <div className="song-row-menu">
                <button
                  className="song-row-menu-btn"
                  onClick={e => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : song.id) }}
                >
                  <DotsIcon />
                </button>
                {menuOpen && (
                  <div className="song-row-dropdown">
                    <button
                      className="song-row-dropdown-item song-row-dropdown-item--danger"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); handleRemove(song.id) }}
                    >
                      Remove track
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="add-track-row">
        <button className="add-row-btn add-row-btn-song" onClick={handleAddTrack}>
          <SmallPlusIcon />
        </button>
      </div>
    </div>
  )
}

export { makeBlankSong }
