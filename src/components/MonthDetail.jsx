import { useState, useRef, useEffect } from 'react'
import SongTable, { makeBlankSong } from './SongTable.jsx'
import AlbumsBlock, { makeBlankAlbum } from './AlbumsBlock.jsx'
import NotesBlock from './NotesBlock.jsx'
import PhotosBlock from './PhotosBlock.jsx'
import MediaBlock from './MediaBlock.jsx'
import Toast from './Toast.jsx'
import AddIcon from '../icons/add-icon.jsx'
import MoveIcon from '../icons/move-icon.jsx'

function uuid() { return crypto.randomUUID() }

function MusicNoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M9 1v6.27A2 2 0 1 1 7 9V3.5L3 4.5V10a2 2 0 1 1-2-2V2.5l8-1.5z" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="1" y="1" width="4" height="4" rx="0.5" />
      <rect x="7" y="1" width="4" height="4" rx="0.5" />
      <rect x="1" y="7" width="4" height="4" rx="0.5" />
      <rect x="7" y="7" width="4" height="4" rx="0.5" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="2" y="1" width="8" height="10" rx="1.2" />
      <line x1="4" y1="4" x2="8" y2="4" />
      <line x1="4" y1="6.5" x2="8" y2="6.5" />
      <line x1="4" y1="9" x2="6.5" y2="9" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="10" height="10" rx="1.5" />
      <circle cx="4" cy="4" r="1" />
      <path d="M1 8l3-3 2.5 2.5L8.5 5 11 8" />
    </svg>
  )
}


function TitleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="2.5" x2="10" y2="2.5" />
      <line x1="6" y1="2.5" x2="6" y2="9.5" />
    </svg>
  )
}


function DuplicateIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <path d="M8 4V2.5C8 1.67 7.33 1 6.5 1H2.5C1.67 1 1 1.67 1 2.5v4C1 7.33 1.67 8 2.5 8H4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h10" />
      <path d="M4 3V2h4v1" />
      <path d="M2 3l.8 7.2A1 1 0 0 0 3.8 11h4.4a1 1 0 0 0 1-.8L10 3" />
    </svg>
  )
}

const BLOCK_TYPES = [
  { type: 'songs',  label: 'Songs',  Icon: MusicNoteIcon },
  { type: 'albums', label: 'Albums', Icon: GridIcon },
  { type: 'notes',  label: 'Notes',  Icon: DocIcon },
  { type: 'photos', label: 'Photos', Icon: ImageIcon },
]

export default function MonthDetail({ month, year, monthData, onSave, onSaveNotesDirect, onSaveTitleDirect, onSaveBlocksDirect, isOwner }) {
  const blocks = monthData?.blocks || []
  const [justCreatedBlock, setJustCreatedBlock] = useState(null)
  const notesTimers = useRef({})

  // ── Pending block removal ────────────────────────────────────────────────
  const [pendingRemovedId, setPendingRemovedId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const pendingRemovalRef = useRef(null)
  const timerRef = useRef(null)

  // ── Block drag reorder ───────────────────────────────────────────────────
  const [dragBlockId, setDragBlockId] = useState(null)
  const [dropTargetBlockId, setDropTargetBlockId] = useState(null)
  const [dropBlockBefore, setDropBlockBefore] = useState(true)
  const dragBlockIdRef = useRef(null)
  const monthBlocksRef = useRef(null)

  // ── Block insertion menu ─────────────────────────────────────────────────
  const [insertMenuBlockId, setInsertMenuBlockId] = useState(null)
  const [insertMenuAbove, setInsertMenuAbove] = useState(false)
  const insertMenuRef = useRef(null)

  // ── Block move menu ──────────────────────────────────────────────────────
  const [moveMenuBlockId, setMoveMenuBlockId] = useState(null)
  const moveMenuRef = useRef(null)

  // ── Title focus ──────────────────────────────────────────────────────────
  const [titleFocusId, setTitleFocusId] = useState(null)

  function handleBlockDragStart(e, blockId) {
    dragBlockIdRef.current = blockId
    setDragBlockId(blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleBlockDragEnd() {
    dragBlockIdRef.current = null
    setDragBlockId(null)
    setDropTargetBlockId(null)
  }

  function handleBlocksContainerDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const wrappers = monthBlocksRef.current?.querySelectorAll('.month-block-wrapper[data-block-id]')
    if (!wrappers?.length) return
    for (const wrapper of wrappers) {
      const rect = wrapper.getBoundingClientRect()
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mid = rect.top + rect.height / 2
        setDropTargetBlockId(wrapper.dataset.blockId)
        setDropBlockBefore(e.clientY < mid)
        return
      }
    }
    setDropTargetBlockId(null)
  }

  function handleBlocksContainerDrop(e) {
    e.preventDefault()
    const dragId = dragBlockIdRef.current
    if (!dropTargetBlockId || !dragId || dragId === dropTargetBlockId) {
      setDragBlockId(null)
      setDropTargetBlockId(null)
      return
    }
    const dragged = blocks.find(b => b.id === dragId)
    if (!dragged) { setDragBlockId(null); setDropTargetBlockId(null); return }
    const rest = blocks.filter(b => b.id !== dragId)
    const targetIdx = rest.findIndex(b => b.id === dropTargetBlockId)
    const insertAt = targetIdx === -1 ? rest.length : dropBlockBefore ? targetIdx : targetIdx + 1
    const next = [...rest]
    next.splice(insertAt, 0, dragged)
    onSave(next)
    setDragBlockId(null)
    setDropTargetBlockId(null)
  }

  // Keep fresh refs for use in cleanup effects
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks
  const onSaveBlocksDirectRef = useRef(onSaveBlocksDirect)
  onSaveBlocksDirectRef.current = onSaveBlocksDirect

  // Commit pending removal when month/year changes or component unmounts
  useEffect(() => {
    return () => {
      if (pendingRemovalRef.current) {
        clearTimeout(timerRef.current)
        const pending = pendingRemovalRef.current
        const filtered = blocksRef.current.filter(b => b.id !== pending.block.id)
        onSaveBlocksDirectRef.current?.(year, month, filtered)
        pendingRemovalRef.current = null
      }
    }
  }, [month, year]) // eslint-disable-line react-hooks/exhaustive-deps

  function commitPendingRemoval() {
    const pending = pendingRemovalRef.current
    if (!pending) return
    const filtered = blocks.filter(b => b.id !== pending.block.id)
    onSave(filtered)
    pendingRemovalRef.current = null
    setPendingRemovedId(null)
    clearTimeout(timerRef.current)
    setToastVisible(false)
  }

  function handleRemoveBlock(blockId) {
    if (pendingRemovalRef.current) {
      clearTimeout(timerRef.current)
      const prev = pendingRemovalRef.current
      onSave(blocks.filter(b => b.id !== prev.block.id))
      pendingRemovalRef.current = null
    }
    const idx = blocks.findIndex(b => b.id === blockId)
    pendingRemovalRef.current = { block: blocks[idx], index: idx }
    setPendingRemovedId(blockId)
    clearTimeout(timerRef.current)
    setToastKey(k => k + 1)
    setToastVisible(true)
    timerRef.current = setTimeout(() => { commitPendingRemoval() }, 5000)
  }

  function handleRestoreBlock() {
    clearTimeout(timerRef.current)
    pendingRemovalRef.current = null
    setPendingRemovedId(null)
    setToastVisible(false)
  }

  // Sync when the month/year identity changes
  const [prevMonth, setPrevMonth] = useState(month)
  const [prevYear, setPrevYear] = useState(year)
  if (month !== prevMonth || year !== prevYear) {
    setPrevMonth(month)
    setPrevYear(year)
    setPendingRemovedId(null)
    setToastVisible(false)
  }

  // Close block dropdowns on outside click / Escape
  useEffect(() => {
    if (!insertMenuBlockId && !moveMenuBlockId) return
    function onMouseDown(e) {
      if (insertMenuRef.current && !insertMenuRef.current.contains(e.target)) setInsertMenuBlockId(null)
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target)) setMoveMenuBlockId(null)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') { setInsertMenuBlockId(null); setMoveMenuBlockId(null) }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [insertMenuBlockId, moveMenuBlockId])

  const displayBlocks = blocks.filter(b => b.id !== pendingRemovedId)

  function handleAddTitle(blockId) {
    setInsertMenuBlockId(null)
    onSave(blocks.map(b => b.id === blockId ? { ...b, titleVisible: true } : b))
    setTitleFocusId(blockId)
  }

  function handleInsertBlock(type, refBlockId, above) {
    setInsertMenuBlockId(null)
    const newBlock = type === 'songs'
      ? { id: uuid(), type: 'songs',  title: 'Songs',  titleVisible: false, items: [makeBlankSong()] }
      : type === 'albums'
      ? { id: uuid(), type: 'albums', title: 'Albums', titleVisible: false, items: [makeBlankAlbum()] }
      : type === 'photos'
      ? { id: uuid(), type: 'photos', title: 'Photos', titleVisible: false, columnCount: 3, photos: [] }
      : { id: uuid(), type: 'notes',  title: 'Notes',  titleVisible: false, content: '' }

    setJustCreatedBlock(newBlock)

    if (!refBlockId) {
      onSave([...blocks, newBlock])
      return
    }
    const refIdx = blocks.findIndex(b => b.id === refBlockId)
    const insertAt = above ? refIdx : refIdx + 1
    const next = [...blocks]
    next.splice(insertAt, 0, newBlock)
    onSave(next)
  }

  function handleInsertBtnClick(e, blockId) {
    e.stopPropagation()
    const above = e.altKey
    setInsertMenuAbove(above)
    setMoveMenuBlockId(null)
    setInsertMenuBlockId(prev => prev === blockId ? null : blockId)
  }

  function handleMoveBtnClick(e, blockId) {
    e.stopPropagation()
    setInsertMenuBlockId(null)
    setMoveMenuBlockId(prev => prev === blockId ? null : blockId)
  }

  function deepCloneBlock(block) {
    const cloned = { ...block, id: uuid() }
    if (cloned.items) cloned.items = cloned.items.map(item => ({ ...item, id: uuid() }))
    if (cloned.photos) cloned.photos = cloned.photos.map(photo => ({ ...photo, id: uuid() }))
    return cloned
  }

  function handleDuplicateBlock(blockId) {
    setMoveMenuBlockId(null)
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    const cloned = deepCloneBlock(block)
    const idx = blocks.findIndex(b => b.id === blockId)
    const next = [...blocks]
    next.splice(idx + 1, 0, cloned)
    onSave(next)
  }

  function handleBlockItemsChange(blockId, items) {
    onSave(blocks.map(b => b.id === blockId ? { ...b, items } : b))
  }

  function handleNotesChange(blockId, content) {
    clearTimeout(notesTimers.current[blockId])
    notesTimers.current[blockId] = setTimeout(() => {
      onSaveNotesDirect(blockId, content)
    }, 300)
  }

  function handleTitleChange(blockId, newTitle) {
    onSaveTitleDirect?.(blockId, newTitle)
  }

  function handlePhotosChange(blockId, photos) {
    const stripped = photos.map(({ data: _data, ...rest }) => rest)
    onSave(blocks.map(b => b.id === blockId ? { ...b, photos: stripped } : b))
  }

  function handleColumnCountChange(blockId, columnCount) {
    onSave(blocks.map(b => b.id === blockId ? { ...b, columnCount } : b))
  }

  function renderInsertDropdown(refBlockId, above, block) {
    return (
      <div className="block-dropdown">
        {BLOCK_TYPES.map(({ type, label, Icon }) => (
          <button
            key={type}
            className="block-dropdown-item"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => handleInsertBlock(type, refBlockId, above)}
          >
            <Icon />
            {label}
          </button>
        ))}
        {block && !block.titleVisible && (
          <button
            className="block-dropdown-item"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => handleAddTitle(block.id)}
          >
            <TitleIcon />
            Add title
          </button>
        )}
        <div className="dropdown-divider" />
        <button
          className="block-dropdown-item block-dropdown-item--close"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => setInsertMenuBlockId(null)}
        >
          <span>Close menu</span>
          <kbd className="kbd-badge">esc</kbd>
        </button>
      </div>
    )
  }

  function renderMoveDropdown(blockId) {
    return (
      <div className="block-dropdown">
        <button
          className="block-dropdown-item"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => handleDuplicateBlock(blockId)}
        >
          <DuplicateIcon />
          Duplicate
        </button>
        <button
          className="block-dropdown-item block-dropdown-item--danger"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => { setMoveMenuBlockId(null); handleRemoveBlock(blockId) }}
        >
          <TrashIcon />
          Delete
        </button>
        <div className="dropdown-divider" />
        <button
          className="block-dropdown-item block-dropdown-item--close"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => setMoveMenuBlockId(null)}
        >
          <span>Close menu</span>
          <kbd className="kbd-badge">esc</kbd>
        </button>
      </div>
    )
  }

  return (
    <div className="month-detail-content">
      <div className="month-detail-header">
        <div className="month-detail-title-group">
          <h1 className="month-detail-title">{month}, {year}</h1>
        </div>
        <div className="month-detail-actions" />
      </div>

      {displayBlocks.length === 0 ? (
        <div className="month-empty-state">
          {isOwner && (
            <div
              className="block-insert-btn-wrapper"
              ref={insertMenuBlockId === '__empty__' ? insertMenuRef : null}
            >
              <button
                className="block-insert-btn block-insert-btn--empty"
                onClick={e => { e.stopPropagation(); setMoveMenuBlockId(null); setInsertMenuBlockId(prev => prev === '__empty__' ? null : '__empty__') }}
              >
                <AddIcon />
              </button>
              {insertMenuBlockId === '__empty__' && renderInsertDropdown(null, false, null)}
            </div>
          )}
        </div>
      ) : (
        <div
          className="month-blocks"
          ref={monthBlocksRef}
          onDragOver={handleBlocksContainerDragOver}
          onDrop={handleBlocksContainerDrop}
        >
          {displayBlocks.map(block => {
            const onRemove = isOwner ? () => handleRemoveBlock(block.id) : undefined

            const isTitleFocused = titleFocusId === block.id

            let blockEl = null
            if (block.type === 'songs') {
              blockEl = (
                <MediaBlock
                  title={block.title}
                  titleVisible={block.titleVisible}
                  editMode={true}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  onRemove={onRemove}
                  focusTitle={isTitleFocused}
                  onTitleFocused={() => setTitleFocusId(null)}
                >
                  <SongTable
                    songs={block.items}
                    editMode={true}
                    onSongsChange={items => handleBlockItemsChange(block.id, items)}
                    onViewSongsChange={items => handleBlockItemsChange(block.id, items)}
                    initialFocusId={justCreatedBlock?.id === block.id ? justCreatedBlock.items?.[0]?.id : null}
                  />
                </MediaBlock>
              )
            } else if (block.type === 'albums') {
              blockEl = (
                <AlbumsBlock
                  block={block}
                  editMode={true}
                  onItemsChange={items => handleBlockItemsChange(block.id, items)}
                  onSave={items => handleBlockItemsChange(block.id, items)}
                  onRemove={onRemove}
                  initialFocusId={justCreatedBlock?.id === block.id ? justCreatedBlock.items?.[0]?.id : null}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  blockDragActive={!!dragBlockId}
                  focusTitle={isTitleFocused}
                  onTitleFocused={() => setTitleFocusId(null)}
                />
              )
            } else if (block.type === 'notes') {
              blockEl = (
                <NotesBlock
                  block={block}
                  onContentChange={content => handleNotesChange(block.id, content)}
                  autoFocus={justCreatedBlock?.id === block.id}
                  editMode={true}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  onRemove={onRemove}
                  focusTitle={isTitleFocused}
                  onTitleFocused={() => setTitleFocusId(null)}
                />
              )
            } else if (block.type === 'photos') {
              blockEl = (
                <PhotosBlock
                  block={block}
                  editMode={true}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  onRemove={onRemove}
                  onPhotosChange={photos => handlePhotosChange(block.id, photos)}
                  onColumnCountChange={columnCount => handleColumnCountChange(block.id, columnCount)}
                  month={month}
                  year={year}
                  focusTitle={isTitleFocused}
                  onTitleFocused={() => setTitleFocusId(null)}
                />
              )
            }

            if (!blockEl) return null
            return (
              <div
                key={block.id}
                data-block-id={block.id}
                className={[
                  'month-block-wrapper',
                  dragBlockId === block.id ? 'block-dragging' : '',
                  dropTargetBlockId === block.id && dropBlockBefore ? 'block-drop-before' : '',
                  dropTargetBlockId === block.id && !dropBlockBefore ? 'block-drop-after' : '',
                ].filter(Boolean).join(' ')}
              >
                {isOwner && (
                  <div className="block-controls">
                    <div
                      className="block-insert-btn-wrapper"
                      ref={insertMenuBlockId === block.id ? insertMenuRef : null}
                    >
                      <button
                        className="block-insert-btn"
                        onClick={e => handleInsertBtnClick(e, block.id)}
                        title="Insert block (Option+click to insert above)"
                      >
                        <AddIcon />
                      </button>
                      {insertMenuBlockId === block.id && renderInsertDropdown(block.id, insertMenuAbove, block)}
                    </div>
                    <div
                      className="block-move-btn-wrapper"
                      ref={moveMenuBlockId === block.id ? moveMenuRef : null}
                    >
                      <button
                        className="block-controls-drag"
                        draggable
                        onDragStart={e => handleBlockDragStart(e, block.id)}
                        onDragEnd={handleBlockDragEnd}
                        onClick={e => handleMoveBtnClick(e, block.id)}
                        title="Drag to reorder or click for options"
                      >
                        <MoveIcon />
                      </button>
                      {moveMenuBlockId === block.id && renderMoveDropdown(block.id)}
                    </div>
                  </div>
                )}
                {blockEl}
              </div>
            )
          })}
        </div>
      )}

      {toastVisible && (
        <Toast key={toastKey} onRestore={handleRestoreBlock} />
      )}
    </div>
  )
}
