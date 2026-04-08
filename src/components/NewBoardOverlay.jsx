import { useState, useRef, useEffect } from 'react'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function NewBoardOverlay({ onDone, onCancel }) {
  const [name, setName] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCoverImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleDone() {
    if (!name.trim()) return
    onDone({
      id: crypto.randomUUID(),
      type: 'board',
      name: name.trim(),
      coverImage: coverImage || null,
      createdAt: new Date().toISOString(),
      songs: [],
    })
  }

  return (
    <div
      className="overlay-scrim"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="overlay-modal">
        <div className="overlay-title">New Board</div>

        <div className="overlay-cover-picker" onClick={() => fileRef.current.click()}>
          {coverImage
            ? <img src={coverImage} alt="" />
            : <span className="overlay-cover-plus"><PlusIcon /></span>
          }
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className="overlay-label">Board Name</div>
        <input
          className="overlay-input"
          value={name}
          placeholder="Name..."
          autoFocus
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleDone() }}
        />

        <div className="overlay-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={handleDone} disabled={!name.trim()}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
