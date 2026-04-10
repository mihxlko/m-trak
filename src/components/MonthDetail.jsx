import { useState, useRef, useEffect } from 'react'
import SongTable, { makeBlankSong } from './SongTable.jsx'
import AlbumsBlock, { makeBlankAlbum } from './AlbumsBlock.jsx'
import NotesBlock from './NotesBlock.jsx'
import MediaBlock from './MediaBlock.jsx'

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

export default function MonthDetail({ month, year, monthData, onSave, onSaveNotesDirect }) {
  const blocks = monthData?.blocks || []
  const [editMode, setEditMode] = useState(false)
  const [draftBlocks, setDraftBlocks] = useState(blocks)
  const [addContentOpen, setAddContentOpen] = useState(false)
  const [justCreatedBlock, setJustCreatedBlock] = useState(null)
  const addContentRef = useRef(null)
  const notesTimers = useRef({})

  // Sync only when the month/year identity changes (not on every data update)
  // This allows notes direct-saves (which call refreshProfileData) to not reset state
  const [prevMonth, setPrevMonth] = useState(month)
  const [prevYear, setPrevYear] = useState(year)
  if (month !== prevMonth || year !== prevYear) {
    setPrevMonth(month)
    setPrevYear(year)
    setDraftBlocks(monthData?.blocks || [])
    setEditMode(false)
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
    setDraftBlocks(blocks)
    setEditMode(true)
  }

  function handleCancel() {
    setDraftBlocks(blocks)
    setEditMode(false)
  }

  function handleDone() {
    const cleaned = draftBlocks.map(b => {
      if (b.type === 'songs') {
        return { ...b, items: b.items.filter(s => s.track.trim() !== '') }
      }
      return b
    }).filter(b => b.type === 'notes' || b.items?.length > 0)
    onSave(cleaned)
    setEditMode(false)
  }

  function handleBlockItemsChange(blockId, items) {
    setDraftBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items } : b))
  }

  function handleAlbumSaveImmediate(blockId, items) {
    const cleaned = blocks.map(b => b.id === blockId ? { ...b, items } : b)
    onSave(cleaned)
  }

  // Notes: update draftBlocks immediately, debounce the direct localStorage save
  function handleNotesChange(blockId, content) {
    setDraftBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b))
    clearTimeout(notesTimers.current[blockId])
    notesTimers.current[blockId] = setTimeout(() => {
      onSaveNotesDirect(blockId, content)
    }, 300)
  }

  const hasBlocks = liveBlocks.length > 0

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
          {liveBlocks.map(block => {
            if (block.type === 'songs') {
              return (
                <MediaBlock key={block.id} title={block.title} titleVisible={block.titleVisible}>
                  <SongTable
                    songs={editMode ? (draftBlocks.find(b => b.id === block.id)?.items || []) : block.items}
                    editMode={editMode}
                    onSongsChange={items => handleBlockItemsChange(block.id, items)}
                    onViewSongsChange={items => onSave(blocks.map(b => b.id === block.id ? { ...b, items } : b))}
                    onEdit={handleEdit}
                    onDone={handleDone}
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
                  initialFocusId={justCreatedBlock?.id === block.id ? justCreatedBlock.items?.[0]?.id : null}
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
    </div>
  )
}
