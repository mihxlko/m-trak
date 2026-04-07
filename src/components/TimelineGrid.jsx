import MonthCard from './MonthCard.jsx'
import MonthListRow from './MonthListRow.jsx'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function TimelineGrid({ yearData, selectedYear, onMonthClick, onCoverChange, viewMode }) {
  return (
    <div className="timeline-grid-content">
      {viewMode === 'list' ? (
        <div className="month-list">
          {MONTHS.map(month => {
            const monthData = yearData?.[month] || { songs: [], coverImage: null }
            return (
              <MonthListRow
                key={month}
                month={month}
                monthData={monthData}
                onRowClick={() => onMonthClick(month)}
                onCoverChange={onCoverChange}
              />
            )
          })}
        </div>
      ) : (
        <div className="month-grid">
          {MONTHS.map(month => {
            const monthData = yearData?.[month] || { songs: [], coverImage: null }
            return (
              <MonthCard
                key={month}
                month={month}
                monthData={monthData}
                onCardClick={() => onMonthClick(month)}
                onCoverChange={onCoverChange}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
