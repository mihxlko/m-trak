import MonthCard from './MonthCard.jsx'
import MonthListRow from './MonthListRow.jsx'
import { MONTHS as MONTH_ORDER } from '../utils/storage.js'

export default function TimelineGrid({ yearData, selectedYear, onMonthClick, onCoverChange, viewMode, onRemoveMonth }) {
  const months = Object.keys(yearData || {})
    .sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))

  if (months.length === 0) {
    return <div className="timeline-grid-content" />
  }

  return (
    <div className="timeline-grid-content">
      {viewMode === 'list' ? (
        <div className="month-list">
          {months.map(month => (
            <MonthListRow
              key={month}
              month={month}
              monthData={yearData[month]}
              onRowClick={() => onMonthClick(month)}
              onCoverChange={onCoverChange}
              onRemove={onRemoveMonth}
            />
          ))}
        </div>
      ) : (
        <div className="month-grid">
          {months.map(month => (
            <MonthCard
              key={month}
              month={month}
              monthData={yearData[month]}
              onCardClick={() => onMonthClick(month)}
              onCoverChange={onCoverChange}
              onRemove={onRemoveMonth}
            />
          ))}
        </div>
      )}
    </div>
  )
}
