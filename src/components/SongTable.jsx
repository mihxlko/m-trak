import { useState, useRef, useEffect } from 'react'

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

function uuid() {
  return crypto.randomUUID()
}

function makeBlankSong() {
  return { id: uuid(), track: '', artist: '', album: '', albumArt: null }
}

const VIEW_COLS = '32px 50px 1fr 1fr 1fr 24px'
const EDIT_COLS = '32px 50px 1fr 1fr 1fr 24px'

export default function SongTable({ songs, editMode, onSongsChange, onViewSongsChange, onEdit, onDone, initialFocusId }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [lastSelectedId, setLastSelectedId] = useState(null)
  const [undoBuffer, setUndoBuffer] = useState(null)
  const [dragIds, setDragIds] = useState(new Set())
  const [dropTargetId, setDropTargetId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const tableRef = useRef(null)
  const focusTrackIdRef = useRef(initialFocusId || null)

  // Clear interaction state when entering edit mode
  useEffect(() => {
    if (editMode) {
      setUndoBuffer(null)
      setSelectedIds(new Set())
      setLastSelectedId(null)
      setOpenMenuId(null)
    }
  }, [editMode])

  // Click outside table: clear selection and close menu
  useEffect(() => {
    function onMouseDown(e) {
      if (!tableRef.current) return
      if (!tableRef.current.contains(e.target)) {
        setSelectedIds(new Set())
        setLastSelectedId(null)
        setOpenMenuId(null)
        setHeaderMenuOpen(false)
      } else if (!e.target.closest('.song-row-menu')) {
        setOpenMenuId(null)
      }
      if (!e.target.closest('.header-menu-dots')) {
        setHeaderMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Escape: clear selection + close menu. Cmd+Z: undo removal
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedIds(new Set())
        setLastSelectedId(null)
        setOpenMenuId(null)
        setHeaderMenuOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !editMode && undoBuffer) {
        e.preventDefault()
        onViewSongsChange(undoBuffer)
        setUndoBuffer(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [undoBuffer, editMode, onViewSongsChange])

  // ── Selection ────────────────────────────────────────────────────────────
  function handleRowClick(e, song, idx) {
    if (editMode) return
    if (e.target.closest('.song-drag-handle') || e.target.closest('.song-row-menu')) return

    if (e.shiftKey && lastSelectedId) {
      const lastIdx = songs.findIndex(s => s.id === lastSelectedId)
      const [start, end] = lastIdx <= idx ? [lastIdx, idx] : [idx, lastIdx]
      const rangeIds = songs.slice(start, end + 1).map(s => s.id)
      setSelectedIds(prev => new Set([...prev, ...rangeIds]))
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(song.id)) next.delete(song.id)
        else next.add(song.id)
        return next
      })
      setLastSelectedId(song.id)
    }
  }

  // ── Drag and drop ────────────────────────────────────────────────────────
  function handleDragStart(e, song) {
    const ids = selectedIds.has(song.id) ? new Set(selectedIds) : new Set([song.id])
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

    const dragged = songs.filter(s => dragIds.has(s.id))
    const rest = songs.filter(s => !dragIds.has(s.id))
    const targetIdx = rest.findIndex(s => s.id === dropTargetId)
    const insertAt = targetIdx === -1
      ? rest.length
      : dropBefore ? targetIdx : targetIdx + 1

    const newSongs = [...rest]
    newSongs.splice(insertAt, 0, ...dragged)
    onViewSongsChange(newSongs)
    setDragIds(new Set())
    setDropTargetId(null)
  }

  // ── Removal + undo ───────────────────────────────────────────────────────
  function handleRemove(songId) {
    const idsToRemove = selectedIds.has(songId) && selectedIds.size > 0
      ? selectedIds
      : new Set([songId])
    setUndoBuffer([...songs])
    onViewSongsChange(songs.filter(s => !idsToRemove.has(s.id)))
    setSelectedIds(new Set())
    setLastSelectedId(null)
    setOpenMenuId(null)
  }

  // ── Edit mode ────────────────────────────────────────────────────────────
  function handleFieldChange(id, field, value) {
    onSongsChange(songs.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function handleAddTrack() {
    const blank = makeBlankSong()
    focusTrackIdRef.current = blank.id
    onSongsChange([...songs, blank])
  }

  if (!editMode && songs.length === 0) return null

  const gridCols = editMode ? EDIT_COLS : VIEW_COLS

  return (
    <div
      className={`song-table ${editMode ? 'edit-mode' : 'view-mode'}`}
      ref={tableRef}
    >
      <div className="song-table-header" style={{ gridTemplateColumns: gridCols }}>
        <span>#</span>
        <span />
        <span>Track</span>
        <span>Artist</span>
        <span>Album</span>
        <span className="header-menu-dots">
          <button
            className="song-row-menu-btn"
            onClick={e => { e.stopPropagation(); setHeaderMenuOpen(prev => !prev) }}
          >
            <DotsIcon />
          </button>
          {headerMenuOpen && (
            <div className="song-row-dropdown">
              <button
                className="song-row-dropdown-item"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  setHeaderMenuOpen(false)
                  editMode ? onDone() : onEdit()
                }}
              >
                {editMode ? 'Done Editing' : 'Edit Block'}
              </button>
            </div>
          )}
        </span>
      </div>

      <div
        className="song-table-rows"
        onDragOver={!editMode ? handleDragOver : undefined}
        onDrop={!editMode ? handleDrop : undefined}
        onDragLeave={!editMode ? handleDragLeave : undefined}
      >
        {songs.map((song, idx) => {
          const isSelected = selectedIds.has(song.id)
          const isDragging = dragIds.has(song.id)
          const isDropTarget = dropTargetId === song.id
          const menuOpen = openMenuId === song.id
          const showDeletePlural = isSelected && selectedIds.size > 1

          const rowClass = [
            'song-row',
            isSelected && 'selected',
            isDragging && 'dragging',
            isDropTarget && dropBefore && 'drop-before',
            isDropTarget && !dropBefore && 'drop-after',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={song.id}
              data-song-id={song.id}
              className={rowClass}
              style={{ gridTemplateColumns: gridCols }}
              onClick={e => handleRowClick(e, song, idx)}
            >
              <div className="song-num-cell">
                <span className="song-row-num">{String(idx + 1).padStart(2, '0')}</span>
                {!editMode && (
                  <span
                    className="song-drag-handle"
                    draggable
                    onDragStart={e => handleDragStart(e, song)}
                    onDragEnd={handleDragEnd}
                  >
                    <DragIcon />
                  </span>
                )}
              </div>

              <div className="song-row-art">
                {song.albumArt && <img src={song.albumArt} alt="" />}
              </div>

              {editMode ? (
                <>
                  <input
                    className="song-input"
                    value={song.track}
                    placeholder="Track Name..."
                    onChange={e => handleFieldChange(song.id, 'track', e.target.value)}
                    ref={el => {
                      if (el && focusTrackIdRef.current === song.id) {
                        el.focus()
                        focusTrackIdRef.current = null
                      }
                    }}
                  />
                  <input
                    className="song-input"
                    value={song.artist}
                    placeholder="Artist Name..."
                    onChange={e => handleFieldChange(song.id, 'artist', e.target.value)}
                  />
                  <input
                    className="song-input"
                    value={song.album}
                    placeholder="Album Name..."
                    onChange={e => handleFieldChange(song.id, 'album', e.target.value)}
                  />
                </>
              ) : (
                <>
                  <span className="song-static-text">{song.track}</span>
                  <span className="song-static-text muted">{song.artist}</span>
                  <span className="song-static-text muted">{song.album}</span>
                </>
              )}

              {!editMode && (
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
                        className="song-row-dropdown-item"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); handleRemove(song.id) }}
                      >
                        {showDeletePlural ? 'Delete tracks' : 'Remove track'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editMode && (
        <div className="add-track-row">
          <button className="btn" onClick={handleAddTrack}>Add Track +</button>
        </div>
      )}
    </div>
  )
}

export { makeBlankSong }
