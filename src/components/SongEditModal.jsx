import { useState, useEffect, useRef } from 'react'
import { searchTracks, getTrackInfo, getCoverArt } from '../utils/musicApi.js'
import { debounce } from '../utils/debounce.js'
import IconClose from '../icons/icon-close.jsx'
import IconMoveHamburger from '../icons/icon-move-hamburger.jsx'
import IconSearch from '../icons/icon-search.jsx'
import AddIcon from '../icons/add-icon.jsx'

function uuid() { return crypto.randomUUID() }

export default function SongEditModal({ title, items, onSave, onClose }) {
  const [draftItems, setDraftItems] = useState(() => items.map(s => ({ ...s })))
  const draftItemsRef = useRef(draftItems)
  draftItemsRef.current = draftItems

  // ── Search ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchActiveIdx, setSearchActiveIdx] = useState(-1)

  // ── Drag reorder ─────────────────────────────────────────────────────────
  const [dragIdx, setDragIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [dragTranslateY, setDragTranslateY] = useState(0)
  const dragIdxRef = useRef(null)
  const dragOverIdxRef = useRef(null)
  const rowHeightRef = useRef(0)
  const pointerStartYRef = useRef(0)
  const rowRectsRef = useRef([])
  const listRef = useRef(null)

  // Escape closes modal
  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // ── Debounced search ─────────────────────────────────────────────────────
  const debouncedSearch = useRef(debounce(async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); setSearchVisible(false); return }
    const results = await searchTracks(query)
    setSearchResults(results)
    setSearchVisible(results.length > 0)
    setSearchActiveIdx(-1)
  }, 300)).current

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    if (!val) { setSearchResults([]); setSearchVisible(false); return }
    debouncedSearch(val)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setSearchResults([])
      setSearchVisible(false)
      return
    }
    if (!searchVisible || !searchResults.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSearchActiveIdx(i => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSearchActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && searchActiveIdx >= 0) {
      e.preventDefault()
      addSong(searchResults[searchActiveIdx])
    }
  }

  function addSong(result) {
    const newSong = {
      id: uuid(),
      track: result.name,
      artist: result.artist,
      album: result.album || '',
      albumArt: null,
      coverUrl: null,
    }
    setDraftItems(prev => [...prev, newSong])
    setSearchQuery('')
    setSearchResults([])
    setSearchVisible(false)

    ;(async () => {
      const info = await getTrackInfo(result.name, result.artist)
      if (!info) return
      setDraftItems(prev => prev.map(s => s.id === newSong.id ? { ...s, album: info.album || s.album } : s))
      const coverUrl = await getCoverArt(info.releaseId)
      if (coverUrl) {
        setDraftItems(prev => prev.map(s => s.id === newSong.id ? { ...s, coverUrl } : s))
      }
    })()
  }

  function removeSong(id) {
    setDraftItems(prev => prev.filter(s => s.id !== id))
  }

  // ── Drag reorder (pointer events) ────────────────────────────────────────
  function handlePointerDown(e, idx) {
    e.preventDefault()
    const rows = listRef.current?.querySelectorAll('.song-edit-modal-row')
    if (!rows?.length) return

    rowRectsRef.current = Array.from(rows).map(r => r.getBoundingClientRect())
    rowHeightRef.current = rows[idx].offsetHeight + 8
    pointerStartYRef.current = e.clientY

    dragIdxRef.current = idx
    dragOverIdxRef.current = idx
    setDragIdx(idx)
    setDragOverIdx(idx)
    setDragTranslateY(0)

    document.body.style.cursor = 'grabbing'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function handlePointerMove(e) {
    if (dragIdxRef.current === null) return

    const deltaY = e.clientY - pointerStartYRef.current
    setDragTranslateY(deltaY)

    const rects = rowRectsRef.current
    let overIdx = rects.length - 1
    for (let i = 0; i < rects.length; i++) {
      const mid = rects[i].top + rects[i].height / 2
      if (e.clientY < mid) { overIdx = i; break }
    }

    if (overIdx !== dragOverIdxRef.current) {
      dragOverIdxRef.current = overIdx
      setDragOverIdx(overIdx)
    }
  }

  function handlePointerUp() {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    document.body.style.cursor = ''

    const from = dragIdxRef.current
    const to = dragOverIdxRef.current
    dragIdxRef.current = null
    dragOverIdxRef.current = null

    if (from !== null && to !== null && from !== to) {
      setDraftItems(prev => {
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return next
      })
    }

    setDragIdx(null)
    setDragOverIdx(null)
    setDragTranslateY(0)
  }

  function getRowStyle(idx) {
    const from = dragIdx
    const to = dragOverIdx
    const h = rowHeightRef.current

    if (from === null || to === null) {
      return { transition: 'transform 0.15s ease, box-shadow 0.1s' }
    }

    if (idx === from) {
      return {
        transform: `translateY(${dragTranslateY}px)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        opacity: 1,
        zIndex: 10,
        position: 'relative',
        transition: 'box-shadow 0.1s',
      }
    }

    if (from < to && idx > from && idx <= to) {
      return { transform: `translateY(-${h}px)`, transition: 'transform 0.15s ease' }
    }
    if (from > to && idx >= to && idx < from) {
      return { transform: `translateY(${h}px)`, transition: 'transform 0.15s ease' }
    }

    return { transition: 'transform 0.15s ease' }
  }

  function handleUpdate() {
    onSave(draftItems)
  }

  return (
    <div className="song-edit-modal-backdrop" onMouseDown={onClose}>
      <div className="song-edit-modal" onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="song-edit-modal-header">
          <span className="song-edit-modal-title">{title}</span>
          <button className="song-edit-modal-header-icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        {/* Song list */}
        <div
          className="song-edit-modal-list"
          ref={listRef}
        >
          {draftItems.map((song, idx) => (
            <div
              key={song.id}
              className={['song-edit-modal-row', dragIdx === idx ? 'dragging' : ''].filter(Boolean).join(' ')}
              style={getRowStyle(idx)}
            >
              <div className="song-edit-row-art">
                {(song.albumArt || song.coverUrl) && (
                  <img src={song.albumArt || song.coverUrl} alt="" />
                )}
              </div>

              <div className="song-edit-row-info">
                <span className="song-edit-row-title">{song.track || 'Untitled'}</span>
                <span className="song-edit-row-sub">
                  {song.artist}
                  {song.album ? <>{' · '}{song.album}</> : null}
                </span>
              </div>

              <div className="song-edit-row-controls">
                <button
                  className="song-edit-modal-icon-btn"
                  onClick={() => removeSong(song.id)}
                  title="Remove"
                >
                  <IconClose />
                </button>
                <span
                  className="song-edit-modal-icon-btn song-edit-drag-handle"
                  onPointerDown={e => handlePointerDown(e, idx)}
                  title="Drag to reorder"
                >
                  <IconMoveHamburger />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Search area */}
        <div className="song-edit-modal-search">
          <div className="song-edit-search-bar-wrapper">
            <div className="song-edit-search-bar">
              <IconSearch className="song-edit-search-icon" />
              <input
                className="song-edit-search-input"
                value={searchQuery}
                placeholder="Search for song to add..."
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onBlur={() => setTimeout(() => setSearchVisible(false), 150)}
                onFocus={() => searchResults.length > 0 && setSearchVisible(true)}
                autoComplete="off"
              />
            </div>

            {searchVisible && searchResults.length > 0 && (
              <div className="song-edit-search-results">
                {searchResults.map((result, i) => {
                  const imageUrl = result.image?.find(img => img.size === 'large')?.['#text']
                  const hasImage = imageUrl && imageUrl.length > 0
                  const isActive = i === searchActiveIdx
                  return (
                    <div
                      key={`${result.name}-${result.artist}-${i}`}
                      className={['song-edit-result-row', isActive ? 'active' : ''].filter(Boolean).join(' ')}
                      onMouseDown={e => { e.preventDefault(); addSong(result) }}
                      onMouseEnter={() => setSearchActiveIdx(i)}
                      onMouseLeave={() => setSearchActiveIdx(-1)}
                    >
                      {hasImage ? (
                        <img src={imageUrl} alt="" className="song-edit-result-thumb" />
                      ) : (
                        <div className="song-edit-result-thumb song-edit-result-thumb--empty" />
                      )}
                      <div className="song-edit-result-info">
                        <span className="song-edit-result-title">{result.name}</span>
                        <span className="song-edit-result-artist">{result.artist}</span>
                      </div>
                      <button
                        className="song-edit-result-add-btn"
                        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); addSong(result) }}
                        title="Add song"
                      >
                        <AddIcon />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="song-edit-modal-footer">
          <button className="song-edit-modal-update-btn" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
