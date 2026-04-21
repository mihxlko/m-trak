import { useState, useRef, useEffect } from 'react'
import MediaBlock from './MediaBlock.jsx'
import Toast from './Toast.jsx'
import { savePhoto, getPhoto, deletePhoto } from '../utils/photosDB.js'

function uuid() { return crypto.randomUUID() }

function SmallPlusIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="1" x2="4" y2="7" />
      <line x1="1" y1="4" x2="7" y2="4" />
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

function PhotoMenu({ onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="photo-menu-wrapper" ref={ref}>
      <button
        className="photo-menu-btn"
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
      >
        <DotsIcon />
      </button>
      {open && (
        <div className="song-row-dropdown photo-dropdown">
          <button
            className="song-row-dropdown-item song-row-dropdown-item--danger"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => { setOpen(false); onRemove() }}
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  )
}

export default function PhotosBlock({
  block,
  editMode,
  onTitleChange,
  onEdit,
  onDone,
  onRemove,
  dragHandleProps,
  onPhotosChange,
  onColumnCountChange,
  month,
  year,
  focusTitle,
  onTitleFocused,
}) {
  const photos = block.photos || []
  const columnCount = block.columnCount || 3

  const [photoDataMap, setPhotoDataMap] = useState({})
  const [pendingRemovedPhotoId, setPendingRemovedPhotoId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const pendingRemovalRef = useRef(null)
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Drag-to-reorder state
  const [dragPhotoId, setDragPhotoId] = useState(null)
  const [dropTargetPhotoId, setDropTargetPhotoId] = useState(null)
  const [dropBefore, setDropBefore] = useState(true)
  const dragPhotoIdRef = useRef(null)
  const dropBeforeRef = useRef(true)

  // Fresh refs for cleanup
  const photosRef = useRef(photos)
  photosRef.current = photos
  const onPhotosChangeRef = useRef(onPhotosChange)
  onPhotosChangeRef.current = onPhotosChange

  // Load photo data from IndexedDB when photos list changes
  useEffect(() => {
    if (!photos.length) return
    photos.forEach(photo => {
      if (photo.data) {
        savePhoto(photo.id, photo.data).catch(() => {})
        setPhotoDataMap(prev => ({ ...prev, [photo.id]: photo.data }))
        return
      }
      setPhotoDataMap(prev => {
        if (prev[photo.id]) return prev
        getPhoto(photo.id).then(data => {
          if (data) setPhotoDataMap(p => ({ ...p, [photo.id]: data }))
        }).catch(() => {})
        return prev
      })
    })
  }, [photos]) // eslint-disable-line react-hooks/exhaustive-deps

  // Commit pending photo removal on month/year navigation
  useEffect(() => {
    return () => {
      if (pendingRemovalRef.current) {
        clearTimeout(timerRef.current)
        const pending = pendingRemovalRef.current
        deletePhoto(pending.photo.id).catch(() => {})
        const filtered = photosRef.current.filter(p => p.id !== pending.photo.id)
        onPhotosChangeRef.current?.(filtered)
        pendingRemovalRef.current = null
      }
    }
  }, [month, year]) // eslint-disable-line react-hooks/exhaustive-deps

  function commitPendingRemoval() {
    const pending = pendingRemovalRef.current
    if (!pending) return
    clearTimeout(timerRef.current)
    deletePhoto(pending.photo.id).catch(() => {})
    setPhotoDataMap(prev => {
      const next = { ...prev }
      delete next[pending.photo.id]
      return next
    })
    const filtered = photos.filter(p => p.id !== pending.photo.id)
    onPhotosChange(filtered)
    pendingRemovalRef.current = null
    setPendingRemovedPhotoId(null)
    setToastVisible(false)
  }

  function handleRemovePhoto(photoId) {
    if (pendingRemovalRef.current) {
      clearTimeout(timerRef.current)
      const prev = pendingRemovalRef.current
      deletePhoto(prev.photo.id).catch(() => {})
      setPhotoDataMap(p => { const n = { ...p }; delete n[prev.photo.id]; return n })
      onPhotosChange(photos.filter(p => p.id !== prev.photo.id))
      pendingRemovalRef.current = null
    }
    const idx = photos.findIndex(p => p.id === photoId)
    pendingRemovalRef.current = { photo: photos[idx], index: idx }
    setPendingRemovedPhotoId(photoId)
    clearTimeout(timerRef.current)
    setToastKey(k => k + 1)
    setToastVisible(true)
    timerRef.current = setTimeout(() => { commitPendingRemoval() }, 5000)
  }

  function handleRestorePhoto() {
    clearTimeout(timerRef.current)
    pendingRemovalRef.current = null
    setPendingRemovedPhotoId(null)
    setToastVisible(false)
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newPhotos = []
    let loaded = 0
    files.forEach(file => {
      const id = uuid()
      const reader = new FileReader()
      reader.onload = evt => {
        const data = evt.target.result
        savePhoto(id, data).catch(() => {})
        setPhotoDataMap(prev => ({ ...prev, [id]: data }))
        newPhotos.push({ id, mimeType: file.type || 'image/jpeg', fileName: file.name })
        loaded++
        if (loaded === files.length) {
          onPhotosChange([...photos, ...newPhotos])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handlePhotoDragStart(e, photoId) {
    dragPhotoIdRef.current = photoId
    setDragPhotoId(photoId)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.position = 'fixed'
    ghost.style.top = '-9999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  function handlePhotoDragOver(e, photoId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (photoId === dragPhotoIdRef.current) {
      setDropTargetPhotoId(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const before = e.clientX < rect.left + rect.width / 2
    dropBeforeRef.current = before
    setDropTargetPhotoId(photoId)
    setDropBefore(before)
  }

  function handlePhotoDrop(e, photoId) {
    e.preventDefault()
    const dragged = dragPhotoIdRef.current
    if (!dragged || dragged === photoId) {
      setDragPhotoId(null)
      setDropTargetPhotoId(null)
      return
    }
    const reordered = photos.filter(p => p.id !== dragged)
    const targetIdx = reordered.findIndex(p => p.id === photoId)
    if (targetIdx === -1) {
      setDragPhotoId(null)
      setDropTargetPhotoId(null)
      return
    }
    const insertAt = dropBeforeRef.current ? targetIdx : targetIdx + 1
    const draggedPhoto = photos.find(p => p.id === dragged)
    reordered.splice(insertAt, 0, draggedPhoto)
    onPhotosChange(reordered)
    dragPhotoIdRef.current = null
    setDragPhotoId(null)
    setDropTargetPhotoId(null)
  }

  function handlePhotoDragEnd() {
    dragPhotoIdRef.current = null
    setDragPhotoId(null)
    setDropTargetPhotoId(null)
  }

  function handleAddSlotDragOver(e) {
    if (!dragPhotoIdRef.current) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetPhotoId('__add__')
  }

  function handleAddSlotDrop(e) {
    e.preventDefault()
    const dragged = dragPhotoIdRef.current
    if (!dragged) return
    const draggedPhoto = photos.find(p => p.id === dragged)
    const reordered = [...photos.filter(p => p.id !== dragged), draggedPhoto]
    onPhotosChange(reordered)
    dragPhotoIdRef.current = null
    setDragPhotoId(null)
    setDropTargetPhotoId(null)
  }

  const displayPhotos = photos.filter(p => p.id !== pendingRemovedPhotoId)

  const columnControls = (
    <div className="column-count-controls">
      {[2, 3, 4].map(n => (
        <button
          key={n}
          className={`column-count-btn${columnCount === n ? ' active' : ''}`}
          onClick={() => onColumnCountChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <MediaBlock
        title={block.title}
        titleVisible={block.titleVisible}
        editMode={editMode}
        onTitleChange={onTitleChange}
        onEdit={onEdit}
        onDone={onDone}
        onRemove={onRemove}
        headerControls={columnControls}
        focusTitle={focusTitle}
        onTitleFocused={onTitleFocused}
      >
        <div className="photos-grid" data-columns={columnCount}>
          {displayPhotos.map(photo => {
            const isDragging = dragPhotoId === photo.id
            const isTarget = dropTargetPhotoId === photo.id
            let itemClass = 'photo-item'
            if (isDragging) itemClass += ' photo-item--dragging'
            if (isTarget) itemClass += dropBefore ? ' photo-item--drop-before' : ' photo-item--drop-after'
            return (
              <div
                key={photo.id}
                className={itemClass}
                draggable
                onDragStart={e => handlePhotoDragStart(e, photo.id)}
                onDragOver={e => handlePhotoDragOver(e, photo.id)}
                onDrop={e => handlePhotoDrop(e, photo.id)}
                onDragEnd={handlePhotoDragEnd}
              >
                <img
                  src={photoDataMap[photo.id] || photo.data || ''}
                  alt={photo.fileName || ''}
                  className="photo-img"
                />
                <PhotoMenu onRemove={() => handleRemovePhoto(photo.id)} />
              </div>
            )
          })}
          <div
            className={`photo-add-btn-wrapper${dropTargetPhotoId === '__add__' ? ' photo-add-btn-wrapper--drop' : ''}`}
            onDragOver={handleAddSlotDragOver}
            onDrop={handleAddSlotDrop}
            onDragLeave={() => { if (dropTargetPhotoId === '__add__') setDropTargetPhotoId(null) }}
          >
            <button
              className="photo-add-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <SmallPlusIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic,.webp,image/heic"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </MediaBlock>
      {toastVisible && (
        <Toast key={toastKey} onRestore={handleRestorePhoto} />
      )}
    </>
  )
}
