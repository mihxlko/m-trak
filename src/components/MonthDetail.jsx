import { useState, useRef, useEffect } from 'react'
import SongTable, { makeBlankSong } from './SongTable.jsx'
import AlbumsBlock, { makeBlankAlbum } from './AlbumsBlock.jsx'
import NotesBlock from './NotesBlock.jsx'
import MediaBlock from './MediaBlock.jsx'
import Toast from './Toast.jsx'

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

export default function MonthDetail({ month, year, monthData, onSave, onSaveNotesDirect, onSaveTitleDirect, onSaveBlocksDirect }) {
  const blocks = monthData?.blocks || []
  const [editMode, setEditMode] = useState(false)
  const [draftBlocks, setDraftBlocks] = useState(blocks)
  const [addContentOpen, setAddContentOpen] = useState(false)
  const [justCreatedBlock, setJustCreatedBlock] = useState(null)
  const addContentRef = useRef(null)
  const notesTimers = useRef({})

  // ── Pending block removal ────────────────────────────────────────────────
  const [pendingRemovedId, setPendingRemovedId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const pendingRemovalRef = useRef(null)
  const timerRef = useRef(null)

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
    // Commit any previous pending removal first
    if (pendingRemovalRef.current) {
      clearTimeout(timerRef.current)
      const prev = pendingRemovalRef.current
      onSave(blocks.filter(b => b.id !== prev.block.id))
      pendingRemovalRef.current = null
    }

    const idx = blocks.findIndex(b => b.id === blockId)
    pendingRemovalRef.current = { block: blocks[idx], index: idx }
    setPendingRemovedId(blockId)

    // Show toast with 5-second timer
    clearTimeout(timerRef.current)
    setToastKey(k => k + 1)
    setToastVisible(true)
    timerRef.current = setTimeout(() => {
      commitPendingRemoval()
    }, 5000)
  }

  function handleRestoreBlock() {
    clearTimeout(timerRef.current)
    pendingRemovalRef.current = null
    setPendingRemovedId(null)
    setToastVisible(false)
  }

  // Sync only when the month/year identity changes
  const [prevMonth, setPrevMonth] = useState(month)
  const [prevYear, setPrevYear] = useState(year)
  if (month !== prevMonth || year !== prevYear) {
    setPrevMonth(month)
    setPrevYear(year)
    setDraftBlocks(monthData?.blocks || [])
    setEditMode(false)
    // Clear toast/pending (cleanup effect handles the save)
    setPendingRemovedId(null)
    setToastVisible(false)
  }

  // Close add-content dropdown on outside click / Escape
  useEffect(() => {
    if (!addContentOpen) return
    function onMouseDown(e) {
      if (addContentRef.current && !addContentRef.current.contains(e.target)) {
        setAddContentOpen(false)
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setAddContentOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [addContentOpen])

  const liveBlocks = editMode ? draftBlocks : blocks
  // Filter out any pending-removed block from display
  const displayBlocks = liveBlocks.filter(b => b.id !== pendingRemovedId)

  function handleAddBlock(type) {
    setAddContentOpen(false)
    const newBlock = type === 'songs'
      ? { id: uuid(), type: 'songs', title: 'Songs', titleVisible: true, items: [makeBlankSong()] }
      : type === 'albums'
      ? { id: uuid(), type: 'albums', title: 'Albums', titleVisible: true, items: [makeBlankAlbum()] }
      : { id: uuid(), type: 'notes', title: 'Notes', titleVisible: true, content: '' }
    const next = [...(editMode ? draftBlocks : blocks), newBlock]
    setDraftBlocks(next)
    setJustCreatedBlock(newBlock)
    setEditMode(true)
  }

  function handleEdit() {
    // Commit any pending removal before entering edit mode
    clearTimeout(timerRef.current)
    const pending = pendingRemovalRef.current
    const currentBlocks = pending ? blocks.filter(b => b.id !== pending.block.id) : blocks
    if (pending) {
      onSave(currentBlocks)
      pendingRemovalRef.current = null
      setPendingRemovedId(null)
      setToastVisible(false)
    }
    setDraftBlocks(currentBlocks)
    setEditMode(true)
  }

  function handleCancel() {
    setDraftBlocks(blocks)
    setEditMode(false)
  }

  function handleDone() {
    const cleaned = draftBlocks
      .filter(b => b.id !== pendingRemovedId)
      .map(b => {
        if (b.type === 'songs') {
          return { ...b, items: b.items.filter(s => s.track.trim() !== '') }
        }
        return b
      }).filter(b => b.type === 'notes' || b.items?.length > 0)
    onSave(cleaned)
    pendingRemovalRef.current = null
    setPendingRemovedId(null)
    clearTimeout(timerRef.current)
    setToastVisible(false)
    setEditMode(false)
  }

  function handleBlockItemsChange(blockId, items) {
    setDraftBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items } : b))
  }

  function handleAlbumSaveImmediate(blockId, items) {
    const cleaned = blocks.map(b => b.id === blockId ? { ...b, items } : b)
    onSave(cleaned)
  }

  function handleNotesChange(blockId, content) {
    setDraftBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b))
    clearTimeout(notesTimers.current[blockId])
    notesTimers.current[blockId] = setTimeout(() => {
      onSaveNotesDirect(blockId, content)
    }, 300)
  }

  function handleTitleChange(blockId, newTitle) {
    setDraftBlocks(prev => prev.map(b => b.id === blockId ? { ...b, title: newTitle } : b))
    onSaveTitleDirect?.(blockId, newTitle)
  }

  const hasBlocks = displayBlocks.length > 0

  const addContentDropdown = (
    <div className="add-content-wrapper" ref={addContentRef}>
      <button className="btn" onClick={() => setAddContentOpen(v => !v)}>
        Add Content +
      </button>
      {addContentOpen && (
        <div className="song-row-dropdown add-content-dropdown">
          <button
            className="song-row-dropdown-item add-content-item"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => handleAddBlock('songs')}
          >
            <MusicNoteIcon />
            Songs
          </button>
          <button
            className="song-row-dropdown-item add-content-item"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => handleAddBlock('albums')}
          >
            <GridIcon />
            Albums
          </button>
          <button
            className="song-row-dropdown-item add-content-item"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => handleAddBlock('notes')}
          >
            <DocIcon />
            Notes
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="month-detail-content">
      <div className="month-detail-header">
        <div className="month-detail-title-group">
          <h1 className="month-detail-title">{month}, {year}</h1>
        </div>
        <div className="month-detail-actions">
          {editMode ? (
            <>
              <button className="btn btn-red" onClick={handleCancel}>Cancel</button>
              <button className="btn" onClick={handleDone}>Done</button>
            </>
          ) : hasBlocks ? (
            <button className="text-btn" onClick={handleEdit}>Edit</button>
          ) : null}
        </div>
      </div>

      {!hasBlocks && !editMode ? (
        <div className="month-empty-state">
          {addContentDropdown}
        </div>
      ) : (
        <div className="month-blocks">
          {displayBlocks.map(block => {
            const onRemove = !editMode ? () => handleRemoveBlock(block.id) : undefined

            if (block.type === 'songs') {
              return (
                <MediaBlock
                  key={block.id}
                  title={block.title}
                  titleVisible={block.titleVisible}
                  editMode={editMode}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  onEdit={handleEdit}
                  onDone={handleDone}
                  onRemove={onRemove}
                >
                  <SongTable
                    songs={editMode ? (draftBlocks.find(b => b.id === block.id)?.items || []) : block.items}
                    editMode={editMode}
                    onSongsChange={items => handleBlockItemsChange(block.id, items)}
                    onViewSongsChange={items => onSave(blocks.map(b => b.id === block.id ? { ...b, items } : b))}
                    initialFocusId={justCreatedBlock?.id === block.id ? justCreatedBlock.items?.[0]?.id : null}
                  />
                </MediaBlock>
              )
            }
            if (block.type === 'albums') {
              return (
                <AlbumsBlock
                  key={block.id}
                  block={editMode ? (draftBlocks.find(b => b.id === block.id) || block) : block}
                  editMode={editMode}
                  onItemsChange={items => handleBlockItemsChange(block.id, items)}
                  onSave={items => handleAlbumSaveImmediate(block.id, items)}
                  onEdit={handleEdit}
                  onDone={handleDone}
                  onRemove={onRemove}
                  initialFocusId={justCreatedBlock?.id === block.id ? justCreatedBlock.items?.[0]?.id : null}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                />
              )
            }
            if (block.type === 'notes') {
              const displayBlock = editMode
                ? (draftBlocks.find(b => b.id === block.id) || block)
                : block
              return (
                <NotesBlock
                  key={block.id}
                  block={displayBlock}
                  onContentChange={content => handleNotesChange(block.id, content)}
                  autoFocus={justCreatedBlock?.id === block.id}
                  editMode={editMode}
                  onTitleChange={newTitle => handleTitleChange(block.id, newTitle)}
                  onRemove={onRemove}
                />
              )
            }
            return null
          })}
          {editMode && (
            <div className="month-add-content-row">
              {addContentDropdown}
            </div>
          )}
        </div>
      )}

      {toastVisible && (
        <Toast key={toastKey} onRestore={handleRestoreBlock} />
      )}
    </div>
  )
}
