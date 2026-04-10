import { useState, useRef, useEffect } from 'react'
import MediaBlock from './MediaBlock.jsx'

function DotsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <circle cx="6" cy="1.5" r="1.2" />
      <circle cx="6" cy="6" r="1.2" />
      <circle cx="6" cy="10.5" r="1.2" />
    </svg>
  )
}

export default function NotesBlock({ block, onContentChange, autoFocus = false }) {
  const [content, setContent] = useState(block.content || '')
  const textareaRef = useRef(null)

  // Apply auto-grow on mount and focus if newly created
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    if (autoFocus) el.focus()
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setContent(val)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
    onContentChange(val)
  }

  const headerMenu = (
    <div className="header-menu-dots" style={{ position: 'relative' }}>
      <button className="song-row-menu-btn" style={{ cursor: 'default' }} tabIndex={-1}>
        <DotsIcon />
      </button>
    </div>
  )

  return (
    <MediaBlock title={block.title} titleVisible={block.titleVisible} headerMenu={headerMenu}>
      <textarea
        ref={textareaRef}
        className="notes-textarea"
        value={content}
        placeholder="Add a note..."
        onChange={handleChange}
        rows={1}
      />
    </MediaBlock>
  )
}
