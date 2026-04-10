import { useState, useRef } from 'react'

function PencilIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.5 1.5L3 8.5H1.5V7L7 1.5z" />
    </svg>
  )
}

export default function MediaBlock({ title, titleVisible = true, headerMenu, children, editMode = false, onTitleChange }) {
  const titleRef = useRef(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const savedTitleRef = useRef(title)

  function handleTitleFocus() {
    savedTitleRef.current = titleRef.current.innerText
    setIsEditingTitle(true)
  }

  function handleTitleBlur() {
    const val = titleRef.current.innerText.trim()
    setIsEditingTitle(false)
    if (val) {
      if (val !== savedTitleRef.current) {
        onTitleChange?.(val)
      }
    } else {
      titleRef.current.innerText = savedTitleRef.current
    }
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleRef.current.blur()
    }
    if (e.key === 'Escape') {
      titleRef.current.innerText = savedTitleRef.current
      titleRef.current.blur()
    }
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
          {headerMenu && <div className="media-block-header-menu">{headerMenu}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
