function FolderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4 10C4 8.9 4.9 8 6 8H13L16 11H26C27.1 11 28 11.9 28 13V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V10Z"
        fill="currentColor" opacity="0.15" />
      <path d="M4 10C4 8.9 4.9 8 6 8H13L16 11H26C27.1 11 28 11.9 28 13V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V10Z"
        stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function renderItem(item, onBoardClick, depthLevel = 0) {
  if (item.type === 'folder') {
    return (
      <div key={item.id} className="board-folder-card">
        <div className="board-folder-icon">
          <FolderIcon />
        </div>
        <div className="board-folder-footer">
          <span className="board-card-name">{item.name}</span>
          {item.children?.length > 0 && (
            <span className="board-card-meta">{item.children.length} item{item.children.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div key={item.id} className="board-card" onClick={() => onBoardClick(item)}>
      <div className="board-card-image-area">
        {item.coverImage && <img src={item.coverImage} alt="" />}
      </div>
      <div className="board-card-footer">
        <span className="board-card-name">{item.name}</span>
        {item.songs?.length > 0 && (
          <span className="board-card-meta">{item.songs.length} track{item.songs.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}

export default function BoardsView({ boardsData, onBoardClick }) {
  if (!boardsData || boardsData.length === 0) {
    return (
      <div className="boards-view-content">
        <div className="boards-empty-state">
          <span>No boards yet. Use Create + to add one.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="boards-view-content">
      <div className="boards-grid">
        {boardsData.map(item => renderItem(item, onBoardClick, 0))}
      </div>
    </div>
  )
}
