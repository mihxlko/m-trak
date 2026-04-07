function uuid() {
  return crypto.randomUUID()
}

function makeBlankSong() {
  return { id: uuid(), track: '', artist: '', album: '', albumArt: null }
}

export default function SongTable({ songs, editMode, onSongsChange }) {
  function handleFieldChange(id, field, value) {
    const updated = songs.map(s => s.id === id ? { ...s, [field]: value } : s)
    onSongsChange(updated)
  }

  function handleAddTrack() {
    onSongsChange([...songs, makeBlankSong()])
  }

  if (!editMode && songs.length === 0) return null

  return (
    <div>
      <div className="song-table-header">
        <span>#</span>
        <span></span>
        <span>Track</span>
        <span>Artist</span>
        <span>Album</span>
      </div>

      <div className="song-table-rows">
        {songs.map((song, idx) => (
          <div className="song-row" key={song.id}>
            <span className="song-row-num">{String(idx + 1).padStart(2, '0')}</span>
            <div className="song-row-art">
              {song.albumArt && <img src={song.albumArt} alt="" />}
            </div>

            {editMode ? (
              <>
                <input
                  className="song-input"
                  value={song.track}
                  placeholder="Track Name..."
                  onChange={e => handleFieldChange(song.id, 'track', e.target.value)}
                />
                <input
                  className="song-input"
                  value={song.artist}
                  placeholder="Artist Name..."
                  onChange={e => handleFieldChange(song.id, 'artist', e.target.value)}
                />
                <input
                  className="song-input"
                  value={song.album}
                  placeholder="Album Name..."
                  onChange={e => handleFieldChange(song.id, 'album', e.target.value)}
                />
              </>
            ) : (
              <>
                <span className="song-static-text">{song.track}</span>
                <span className="song-static-text muted">{song.artist}</span>
                <span className="song-static-text muted">{song.album}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {editMode && (
        <div className="add-track-row">
          <button className="pill-btn" onClick={handleAddTrack}>Add Track +</button>
        </div>
      )}
    </div>
  )
}

export { makeBlankSong }
