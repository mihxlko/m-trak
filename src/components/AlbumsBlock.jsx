import { useState, useRef } from 'react'
import MediaBlock from './MediaBlock.jsx'
import AlbumCard from './AlbumCard.jsx'

function uuid() {
  return crypto.randomUUID()
}

export function makeBlankAlbum() {
  return { id: uuid(), albumName: '', artistName: '', albumArtUrl: null }
}

export default function AlbumsBlock({ block, editMode, onItemsChange, onSave, onEdit, onDone, initialFocusId, onTitleChange, onRemove, dragHandleProps, blockDragActive }) {
  const [dragId, setDragId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const containerRef = useRef(null)
  const focusAlbumIdRef = useRef(initialFocusId || null)

  const albums = block.items || []

  // Clear internal drop state whenever block-level drag becomes active
  if (blockDragActive && (dropTargetId !== null || dragId !== null)) {
    setDropTargetId(null)
    setDragId(null)
  }

  function handleFieldChange(id, field, value) {
    onItemsChange(albums.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  function handleSelectResult(id, result) {
    const imageUrl = result.image?.find(img => img.size === 'large')?.['#text']
    const coverUrl = imageUrl && imageUrl.length > 0 ? imageUrl : null
    onItemsChange(albums.map(a => a.id === id
      ? { ...a, albumName: result.name, artistName: result.artist, coverUrl }
      : a
    ))
  }

  function handleDelete(id) {
    const next = albums.filter(a => a.id !== id)
    onItemsChange(next)
    onSave(next)
  }

  function handleAddAlbum() {
    const blank = makeBlankAlbum()
    focusAlbumIdRef.current = blank.id
    onItemsChange([...albums, blank])
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

  return (
    <MediaBlock
      title={block.title}
      titleVisible={block.titleVisible}
      editMode={editMode}
      onTitleChange={onTitleChange}
      onEdit={onEdit}
      onDone={onDone}
      onRemove={onRemove}
      dragHandleProps={dragHandleProps}
    >
      <div
        className="albums-grid"
        ref={containerRef}
        onDragOver={!editMode && !blockDragActive ? handleDragOver : undefined}
        onDrop={!editMode && !blockDragActive ? handleDrop : undefined}
        onDragLeave={!editMode && !blockDragActive ? () => setDropTargetId(null) : undefined}
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
                onSelectResult={handleSelectResult}
                onDelete={handleDelete}
                focusIdRef={focusAlbumIdRef}
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
