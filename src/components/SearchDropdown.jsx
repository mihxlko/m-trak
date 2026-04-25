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
      className="search-dropdown"
      onKeyDown={onKeyDown}
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
            className={`search-dropdown-item${isActive ? ' active' : ''}`}
            onMouseDown={e => { e.preventDefault(); onSelect(result) }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {hasImage ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: 32, height: 32, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div className="search-dropdown-thumb" />
            )}
            <div className="search-dropdown-info">
              <span className="search-dropdown-title">{result.name}</span>
              <span className="search-dropdown-artist">{result.artist}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default SearchDropdown
