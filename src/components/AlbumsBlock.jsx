import { useState, useRef, useEffect } from 'react'
import MediaBlock from './MediaBlock.jsx'
import AlbumCard from './AlbumCard.jsx'
import AddIcon from '../icons/add-icon.jsx'

function uuid() {
  return crypto.randomUUID()
}

export function makeBlankAlbum() {
  return { id: uuid(), albumName: '', artistName: '', coverUrl: null }
}

export default function AlbumsBlock({ block, editMode, onItemsChange, onSave, onEdit, onDone, initialFocusId, onTitleChange, onRemove, dragHandleProps, blockDragActive, focusTitle, onTitleFocused }) {
  const [dragId, setDragId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const [addBtnWrapped, setAddBtnWrapped] = useState(false)
  const containerRef = useRef(null)
  const lastCardRef = useRef(null)
  const addBtnRef = useRef(null)
  const focusAlbumIdRef = useRef(initialFocusId || null)

  const albums = block.items || []

  // Clear internal drop state whenever block-level drag becomes active
  if (blockDragActive && (dropTargetId !== null || dragId !== null)) {
    setDropTargetId(null)
    setDragId(null)
  }

  useEffect(() => {
    function check() {
      if (!lastCardRef.current || !addBtnRef.current) return
      setAddBtnWrapped(addBtnRef.current.offsetTop > lastCardRef.current.offsetTop)
    }
    check()
    const observer = new ResizeObserver(check)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [albums])

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

  function handleAlbumArtChange(id, dataUrl) {
    handleFieldChange(id, 'coverUrl', dataUrl)
  }

  function handleAddAlbum() {
    const blank = makeBlankAlbum()
    focusAlbumIdRef.current = blank.id
    const next = [...albums, blank]
    onItemsChange(next)
    onSave(next)
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
      focusTitle={focusTitle}
      onTitleFocused={onTitleFocused}
    >
      <div className="album-grid-wrapper">
        <div
          className="albums-grid"
          ref={containerRef}
          onDragOver={!blockDragActive ? handleDragOver : undefined}
          onDrop={!blockDragActive ? handleDrop : undefined}
          onDragLeave={!blockDragActive ? () => setDropTargetId(null) : undefined}
        >
          {albums.map((album, index) => {
            const isLast = index === albums.length - 1
            const isDropTarget = dropTargetId === album.id
            const wrapperClassName = [
              'album-card-wrapper',
              dragId === album.id ? 'dragging' : '',
              isDropTarget && dropBefore ? 'drop-before' : '',
              isDropTarget && !dropBefore ? 'drop-after' : '',
            ].filter(Boolean).join(' ')

            if (isLast) {
              return (
                <div key={album.id} className="album-add-zone-wrapper">
                  <div ref={lastCardRef} data-album-id={album.id} className={wrapperClassName}>
                    <AlbumCard
                      album={album}
                      onFieldChange={handleFieldChange}
                      onSelectResult={handleSelectResult}
                      onDelete={handleDelete}
                      onAlbumArtChange={handleAlbumArtChange}
                      focusIdRef={focusAlbumIdRef}
                      dragHandleProps={!blockDragActive ? {
                        draggable: true,
                        onDragStart: e => handleDragStart(e, album),
                        onDragEnd: handleDragEnd,
                      } : {}}
                    />
                  </div>
                  {!addBtnWrapped && (
                    <button ref={addBtnRef} className="album-add-btn" onClick={handleAddAlbum}>
                      <AddIcon />
                    </button>
                  )}
                </div>
              )
            }

            return (
              <div key={album.id} data-album-id={album.id} className={wrapperClassName}>
                <AlbumCard
                  album={album}
                  onFieldChange={handleFieldChange}
                  onSelectResult={handleSelectResult}
                  onDelete={handleDelete}
                  onAlbumArtChange={handleAlbumArtChange}
                  focusIdRef={focusAlbumIdRef}
                  dragHandleProps={!blockDragActive ? {
                    draggable: true,
                    onDragStart: e => handleDragStart(e, album),
                    onDragEnd: handleDragEnd,
                  } : {}}
                />
              </div>
            )
          })}
          {albums.length === 0 && (
            <button className="album-add-btn" onClick={handleAddAlbum}>
              <AddIcon />
            </button>
          )}
        </div>
        {addBtnWrapped && (
          <>
            <div className="album-grid-hover-zone" />
            <div className="add-row-btn-album-wrapper">
              <button className="add-row-btn add-row-btn-album" onClick={handleAddAlbum}>
                <AddIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </MediaBlock>
  )
}
