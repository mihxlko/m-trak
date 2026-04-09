import { useState, useRef } from 'react'
import MediaBlock from './MediaBlock.jsx'
import AlbumCard from './AlbumCard.jsx'

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

export function makeBlankAlbum() {
  return { id: uuid(), albumName: '', artistName: '', albumArtUrl: null }
}

export default function AlbumsBlock({ block, editMode, onItemsChange, onSave, onEdit, onDone }) {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const containerRef = useRef(null)
  const headerMenuRef = useRef(null)

  const albums = block.items || []

  function handleFieldChange(id, field, value) {
    onItemsChange(albums.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  function handleDelete(id) {
    const next = albums.filter(a => a.id !== id)
    onItemsChange(next)
    onSave(next)
  }

  function handleAddAlbum() {
    onItemsChange([...albums, makeBlankAlbum()])
  }

  // ── Drag reorder ────────────────────────────────────────────────────────
  function handleDragStart(e, album) {
    setDragId(album.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setDragId(null)
    setDropTargetId(null)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const cards = containerRef.current?.querySelectorAll('.album-card-wrapper[data-album-id]')
    if (!cards?.length) return
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mid = rect.left + rect.width / 2
        setDropTargetId(card.dataset.albumId)
        setDropBefore(e.clientX < mid)
        return
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    if (!dropTargetId || !dragId) { setDragId(null); setDropTargetId(null); return }
    const dragged = albums.find(a => a.id === dragId)
    const rest = albums.filter(a => a.id !== dragId)
    const targetIdx = rest.findIndex(a => a.id === dropTargetId)
    const insertAt = targetIdx === -1 ? rest.length : dropBefore ? targetIdx : targetIdx + 1
    const next = [...rest]
    next.splice(insertAt, 0, dragged)
    onItemsChange(next)
    onSave(next)
    setDragId(null)
    setDropTargetId(null)
  }

  const headerMenu = (
    <div className="header-menu-dots" ref={headerMenuRef} style={{ position: 'relative' }}>
      <button
        className="song-row-menu-btn"
        onClick={e => { e.stopPropagation(); setHeaderMenuOpen(v => !v) }}
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
    </div>
  )

  return (
    <MediaBlock title={block.title} titleVisible={block.titleVisible} headerMenu={headerMenu}>
      <div
        className="albums-grid"
        ref={containerRef}
        onDragOver={!editMode ? handleDragOver : undefined}
        onDrop={!editMode ? handleDrop : undefined}
        onDragLeave={!editMode ? () => setDropTargetId(null) : undefined}
      >
        {albums.map(album => {
          const isDropTarget = dropTargetId === album.id
          return (
            <div
              key={album.id}
              data-album-id={album.id}
              className={[
                'album-card-wrapper',
                dragId === album.id ? 'dragging' : '',
                isDropTarget && dropBefore ? 'drop-before' : '',
                isDropTarget && !dropBefore ? 'drop-after' : '',
              ].filter(Boolean).join(' ')}
            >
              <AlbumCard
                album={album}
                editMode={editMode}
                onFieldChange={handleFieldChange}
                onDelete={handleDelete}
                dragHandleProps={!editMode ? {
                  draggable: true,
                  onDragStart: e => handleDragStart(e, album),
                  onDragEnd: handleDragEnd,
                } : {}}
              />
            </div>
          )
        })}
        {editMode && (
          <button className="btn" onClick={handleAddAlbum}>Add Album +</button>
        )}
      </div>
    </MediaBlock>
  )
}
