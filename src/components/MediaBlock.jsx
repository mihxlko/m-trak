export default function MediaBlock({ title, titleVisible = true, headerMenu, children }) {
  return (
    <div className="media-block">
      {titleVisible && title && (
        <div className="media-block-label-row">
          <span className="month-detail-sub">{title}</span>
          {headerMenu && <div className="media-block-header-menu">{headerMenu}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
