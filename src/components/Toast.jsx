export default function Toast({ message = 'Moved to Trash', action, onAction }) {
  return (
    <div className="toast-container">
      <div className="toast">
        <span className="toast-text">{message}</span>
        {action && <button className="toast-restore-btn" onClick={onAction}>{action}</button>}
      </div>
      <div className="toast-progress" />
    </div>
  )
}
