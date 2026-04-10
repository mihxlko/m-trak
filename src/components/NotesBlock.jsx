import { useState, useRef, useEffect } from 'react'
import MediaBlock from './MediaBlock.jsx'

export default function NotesBlock({ block, onContentChange, autoFocus = false, editMode = false, onTitleChange, onRemove }) {
  const [content, setContent] = useState(block.content || '')
  const textareaRef = useRef(null)

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

  return (
    <MediaBlock
      title={block.title}
      titleVisible={block.titleVisible}
      editMode={editMode}
      onTitleChange={onTitleChange}
      onRemove={onRemove}
    >
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
