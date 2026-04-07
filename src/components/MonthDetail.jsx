import { useState } from 'react'
import SongTable, { makeBlankSong } from './SongTable.jsx'

export default function MonthDetail({ month, year, monthData, onSave }) {
  const hasSongs = monthData.songs && monthData.songs.length > 0
  const [editMode, setEditMode] = useState(false)
  const [draftSongs, setDraftSongs] = useState(monthData.songs || [])

  // Sync when monthData changes (profile/month switch)
  const [prevData, setPrevData] = useState(monthData)
  if (monthData !== prevData) {
    setPrevData(monthData)
    setDraftSongs(monthData.songs || [])
    setEditMode(false)
  }

  function handleAddContent() {
    setDraftSongs([makeBlankSong()])
    setEditMode(true)
  }

  function handleEdit() {
    setDraftSongs(monthData.songs || [])
    setEditMode(true)
  }

  function handleDone() {
    const filtered = draftSongs.filter(s => s.track.trim() !== '')
    onSave(filtered)
    setEditMode(false)
  }

  return (
    <div className="month-detail-content">
      <div className="month-detail-header">
        <div className="month-detail-title-group">
          <h1 className="month-detail-title">{month}, {year}</h1>
          <span className="month-detail-sub">Songs</span>
        </div>

        <div className="month-detail-actions">
          {editMode ? (
            <button className="pill-btn" onClick={handleDone}>Done</button>
          ) : hasSongs ? (
            <button className="text-btn" onClick={handleEdit}>Edit</button>
          ) : null}
        </div>
      </div>

      {!editMode && !hasSongs ? (
        <div className="month-empty-state">
          <button className="pill-btn" onClick={handleAddContent}>Add Content +</button>
        </div>
      ) : (
        <SongTable
          songs={editMode ? draftSongs : (monthData.songs || [])}
          editMode={editMode}
          onSongsChange={setDraftSongs}
        />
      )}
    </div>
  )
}
