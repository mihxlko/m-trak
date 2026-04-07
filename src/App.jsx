import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import TimelineGrid from './components/TimelineGrid.jsx'
import MonthDetail from './components/MonthDetail.jsx'
import {
  initializeProfiles,
  getActiveProfile,
  setActiveProfile,
  getProfileData,
  saveMonthData,
  getViewPreference,
  setViewPreference,
} from './utils/storage.js'
import './styles.css'

export default function App() {
  useEffect(() => { initializeProfiles() }, [])

  const [activeProfileId, setActiveProfileId] = useState(() => getActiveProfile())
  const [selectedYear, setSelectedYear] = useState('2026')
  const [currentView, setCurrentView] = useState('timeline') // 'timeline' | 'month'
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [profileData, setProfileData] = useState(() => getProfileData(getActiveProfile()))
  const [viewMode, setViewMode] = useState(() => getViewPreference()) // 'grid' | 'list'

  function refreshProfileData(profileId) {
    setProfileData(getProfileData(profileId))
  }

  function handleSwitchProfile(profileId) {
    setActiveProfile(profileId)
    setActiveProfileId(profileId)
    setCurrentView('timeline')
    setSelectedMonth(null)
    refreshProfileData(profileId)
  }

  function handleYearChange(year) {
    setSelectedYear(year)
    if (currentView === 'month') {
      setCurrentView('timeline')
      setSelectedMonth(null)
    }
  }

  function handleMonthClick(month) {
    setSelectedMonth(month)
    setCurrentView('month')
  }

  function handleToggleView() {
    const next = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    setViewPreference(next)
  }

  function handleNavigateBack() {
    setCurrentView('timeline')
    setSelectedMonth(null)
  }

  function handleCoverChange(month, base64) {
    const monthData = profileData?.[selectedYear]?.[month] || { songs: [], coverImage: null }
    const updated = { ...monthData, coverImage: base64 }
    saveMonthData(activeProfileId, selectedYear, month, updated)
    refreshProfileData(activeProfileId)
  }

  function handleSaveSongs(songs) {
    const monthData = profileData?.[selectedYear]?.[selectedMonth] || { songs: [], coverImage: null }
    const updated = { ...monthData, songs }
    saveMonthData(activeProfileId, selectedYear, selectedMonth, updated)
    refreshProfileData(activeProfileId)
  }

  const yearData = profileData?.[selectedYear] || {}
  const currentMonthData = selectedMonth
    ? (yearData?.[selectedMonth] || { songs: [], coverImage: null })
    : null

  return (
    <div className="app-layout">
      <Sidebar
        activeProfileId={activeProfileId}
        onSwitchProfile={handleSwitchProfile}
        currentView={currentView}
      />

      <div className="main-area">
        <TopBar
          currentView={currentView}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          onNavigateBack={handleNavigateBack}
          viewMode={viewMode}
          onToggleView={handleToggleView}
        />

        {currentView === 'timeline' ? (
          <TimelineGrid
            yearData={yearData}
            selectedYear={selectedYear}
            onMonthClick={handleMonthClick}
            onCoverChange={handleCoverChange}
            viewMode={viewMode}
          />
        ) : (
          <MonthDetail
            month={selectedMonth}
            year={selectedYear}
            monthData={currentMonthData}
            onSave={handleSaveSongs}
          />
        )}
      </div>
    </div>
  )
}
