import { useState, useRef, useEffect } from 'react'

function PencilIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.5 1.5L3 8.5H1.5V7L7 1.5z" />
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

function DragIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
      <circle cx="3" cy="2.5" r="1.1" />
      <circle cx="7" cy="2.5" r="1.1" />
      <circle cx="3" cy="7" r="1.1" />
      <circle cx="7" cy="7" r="1.1" />
      <circle cx="3" cy="11.5" r="1.1" />
      <circle cx="7" cy="11.5" r="1.1" />
    </svg>
  )
}

export default function MediaBlock({
  title, titleVisible = true, children,
  editMode = false, onTitleChange,
  onEdit, onDone, onRemove,
  dragHandleProps,
  headerControls,
}) {
  const titleRef = useRef(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const savedTitleRef = useRef(title)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const hasMenu = !!(onEdit || onDone || onRemove)

  useEffect(() => {
    if (!menuOpen) return
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKeyDown(e) { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function handleTitleFocus() {
    savedTitleRef.current = titleRef.current.innerText
    setIsEditingTitle(true)
  }

  function handleTitleBlur() {
    const val = titleRef.current.innerText.trim()
    setIsEditingTitle(false)
    if (val) {
      if (val !== savedTitleRef.current) onTitleChange?.(val)
    } else {
      titleRef.current.innerText = savedTitleRef.current
    }
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); titleRef.current.blur() }
    if (e.key === 'Escape') { titleRef.current.innerText = savedTitleRef.current; titleRef.current.blur() }
  }

  function handlePencilMouseDown(e) {
    e.preventDefault()
    const el = titleRef.current
    if (!el) return
    el.focus()
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  return (
    <div className="media-block">
      {titleVisible && (
        <div className="media-block-label-row">
          <div className="media-block-title-group">
            {dragHandleProps && (
              <span className="block-drag-handle" {...dragHandleProps}>
                <DragIcon />
              </span>
            )}
            <span
              ref={titleRef}
              className={`month-detail-sub media-block-title${isEditingTitle ? ' editing' : ''}`}
              contentEditable={editMode ? 'true' : 'false'}
              suppressContentEditableWarning
              onFocus={editMode ? handleTitleFocus : undefined}
              onBlur={editMode ? handleTitleBlur : undefined}
              onKeyDown={editMode ? handleTitleKeyDown : undefined}
              dangerouslySetInnerHTML={{ __html: title || '' }}
            />
            {editMode && (
              <button className="title-pencil-btn" onMouseDown={handlePencilMouseDown} tabIndex={-1}>
                <PencilIcon />
              </button>
            )}
          </div>

          {headerControls && (
            <div className="media-block-header-controls">{headerControls}</div>
          )}

          {hasMenu && (
            <div className="media-block-header-menu" ref={menuRef} style={{ position: 'relative' }}>
              <button
                className="song-row-menu-btn"
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              >
                <DotsIcon />
              </button>
              {menuOpen && (
                <div className="song-row-dropdown">
                  {editMode ? (
                    <button
                      className="song-row-dropdown-item"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => { setMenuOpen(false); onDone?.() }}
                    >
                      Done Editing
                    </button>
                  ) : (
                    <>
                      {onEdit && (
                        <button
                          className="song-row-dropdown-item"
                          onMouseDown={e => e.stopPropagation()}
                          onClick={() => { setMenuOpen(false); onEdit() }}
                        >
                          Edit Block
                        </button>
                      )}
                      {onEdit && onRemove && <div className="dropdown-divider" />}
                      {onRemove && (
                        <button
                          className="song-row-dropdown-item song-row-dropdown-item--danger"
                          onMouseDown={e => e.stopPropagation()}
                          onClick={() => { setMenuOpen(false); onRemove() }}
                        >
                          Remove Block
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
