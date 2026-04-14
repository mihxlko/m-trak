import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

const SearchDropdown = forwardRef(function SearchDropdown(
  { results, onSelect, visible, onDismiss, onKeyDown },
  ref
) {
  const [activeIndex, setActiveIndex] = useState(-1)

  // Reset active item whenever results change
  useEffect(() => { setActiveIndex(-1) }, [results])

  useImperativeHandle(ref, () => ({
    handleKeyDown(e) {
      if (!visible || !results.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0) {
          e.preventDefault()
          onSelect(results[activeIndex])
        }
      } else if (e.key === 'Escape') {
        onDismiss?.()
      }
    }
  }), [visible, results, activeIndex, onSelect, onDismiss])

  if (!visible || !results.length) return null

  return (
    <div
      role="listbox"
      onKeyDown={onKeyDown}
      style={{
        position: 'absolute',
        width: '400px',
        top: 'calc(100% + 4px)',
        left: 0,
        zIndex: 100,
        background: '#F9F9F8',
        border: '1px solid #E8E6E5',
        borderRadius: '6px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
      }}
    >
      {results.map((result, i) => {
        const imageUrl = result.image?.find(img => img.size === 'large')?.['#text']
        const hasImage = imageUrl && imageUrl.length > 0
        const isActive = i === activeIndex
        return (
          <div
            key={`${result.name}-${result.artist}-${i}`}
            role="option"
            aria-selected={isActive}
            onMouseDown={e => { e.preventDefault(); onSelect(result) }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: isActive ? '#F3F3F2' : 'transparent',
            }}
          >
            {hasImage ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: 32, height: 32, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 3, background: '#E8E6E5', flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 13, color: '#222323', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {result.name}
              </span>
              <span style={{ fontSize: 12, color: '#D0CDCA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {result.artist}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default SearchDropdown
