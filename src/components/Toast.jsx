export default function Toast({ onRestore }) {
  return (
    <div className="toast-container">
      <div className="toast">
        <span className="toast-text">Moved to Trash</span>
        <button className="toast-restore-btn" onClick={onRestore}>Restore</button>
      </div>
      <div className="toast-progress" />
    </div>
  )
}
