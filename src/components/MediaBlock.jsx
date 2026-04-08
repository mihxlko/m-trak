export default function MediaBlock({
  title,
  titleVisible = true,
  titleEditable = false,
  onTitleChange = null,
  children,
}) {
  return (
    <div className="media-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {titleVisible && title && (
        <span className="month-detail-sub">{title}</span>
      )}
      {children}
    </div>
  )
}
