import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import TimelineGrid from './components/TimelineGrid.jsx'
import MonthDetail from './components/MonthDetail.jsx'
import BoardsView from './components/BoardsView.jsx'
import NewBoardOverlay from './components/NewBoardOverlay.jsx'
import NewYearOverlay from './components/NewYearOverlay.jsx'
import NewMonthOverlay from './components/NewMonthOverlay.jsx'
import SettingsOverlay from './components/SettingsOverlay.jsx'
import {
  initializeProfiles,
  getActiveProfile,
  setActiveProfile,
  getProfileData,
  saveMonthData,
  addYearToData,
  addMonthToData,
  getViewPreference,
  setViewPreference,
  getSidebarOpen,
  setSidebarOpen,
  getBoardsData,
  saveBoardsData,
  addItemToRoot,
  MONTHS as MONTH_ORDER,
} from './utils/storage.js'
import './styles.css'

export default function App() {
  useEffect(() => { initializeProfiles() }, [])

  const [activeProfileId, setActiveProfileId] = useState(() => getActiveProfile())
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()))
  const [currentView, setCurrentView] = useState('timeline') // 'timeline' | 'month' | 'yourBoards' | 'boardDetail'
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [profileData, setProfileData] = useState(() => getProfileData(getActiveProfile()))
  const [boardsData, setBoardsData] = useState(() => getBoardsData(getActiveProfile()))
  const [viewMode, setViewMode] = useState(() => getViewPreference()) // 'grid' | 'list'
  const [sidebarOpen, setSidebarOpenState] = useState(() => getSidebarOpen(getActiveProfile()))
  const [showNewBoardOverlay, setShowNewBoardOverlay] = useState(false)
  const [showNewYearOverlay, setShowNewYearOverlay] = useState(false)
  const [showNewMonthOverlay, setShowNewMonthOverlay] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // "," shortcut opens settings (when not focused in an input)
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== ',') return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      e.preventDefault()
      setSettingsOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Derive the sorted list of available years, always including the current year
  const currentCalendarYear = String(new Date().getFullYear())
  const existingYears = Object.keys(profileData?.years || {})
  const years = [...new Set([...existingYears, currentCalendarYear])]
    .sort((a, b) => Number(a) - Number(b))

  const yearData = profileData?.years?.[selectedYear] || {}
  const existingMonths = Object.keys(yearData)

  const currentMonthData = selectedMonth
    ? (yearData?.[selectedMonth] || { blocks: [], coverImage: null })
    : null

  function refreshProfileData(profileId) {
    setProfileData(getProfileData(profileId))
  }

  function handleSwitchProfile(profileId) {
    setActiveProfile(profileId)
    setActiveProfileId(profileId)
    setCurrentView('timeline')
    setSelectedMonth(null)
    setSelectedBoard(null)
    setSelectedYear(String(new Date().getFullYear()))
    refreshProfileData(profileId)
    setBoardsData(getBoardsData(profileId))
    setSidebarOpenState(getSidebarOpen(profileId))
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

  function handleNavigateToTimeline() {
    setCurrentView('timeline')
    setSelectedMonth(null)
    setSelectedBoard(null)
  }

  function handleNavigateToBoards() {
    setCurrentView('yourBoards')
    setSelectedMonth(null)
    setSelectedBoard(null)
  }

  function handleNavigateBack() {
    if (currentView === 'month') {
      setCurrentView('timeline')
      setSelectedMonth(null)
    } else if (currentView === 'boardDetail') {
      setCurrentView('yourBoards')
      setSelectedBoard(null)
    }
  }

  function handleBoardClick(board) {
    setSelectedBoard(board)
    setCurrentView('boardDetail')
  }

  function handleToggleView() {
    const next = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    setViewPreference(next)
  }

  function handleToggleSidebar() {
    const next = !sidebarOpen
    setSidebarOpenState(next)
    setSidebarOpen(activeProfileId, next)
  }

  function handleCoverChange(month, base64) {
    const monthData = profileData?.years?.[selectedYear]?.[month] || { blocks: [], coverImage: null }
    const updated = { ...monthData, coverImage: base64 }
    saveMonthData(activeProfileId, selectedYear, month, updated)
    refreshProfileData(activeProfileId)
  }

  function handleSaveBlocks(blocks) {
    const monthData = profileData?.years?.[selectedYear]?.[selectedMonth] || { blocks: [], coverImage: null }
    const updated = { ...monthData, blocks }
    saveMonthData(activeProfileId, selectedYear, selectedMonth, updated)
    refreshProfileData(activeProfileId)
  }

  function handleSaveTitleDirect(blockId, newTitle) {
    const fresh = getProfileData(activeProfileId)
    const current = fresh?.years?.[selectedYear]?.[selectedMonth]
    if (!current?.blocks) return
    if (!current.blocks.some(b => b.id === blockId)) return
    const updated = { ...current, blocks: current.blocks.map(b => b.id === blockId ? { ...b, title: newTitle } : b) }
    saveMonthData(activeProfileId, selectedYear, selectedMonth, updated)
    refreshProfileData(activeProfileId)
  }

  function handleSaveNotesDirect(blockId, content) {
    const fresh = getProfileData(activeProfileId)
    const current = fresh?.years?.[selectedYear]?.[selectedMonth]
    if (!current?.blocks) return
    if (!current.blocks.some(b => b.id === blockId)) return
    const updated = { ...current, blocks: current.blocks.map(b => b.id === blockId ? { ...b, content } : b) }
    saveMonthData(activeProfileId, selectedYear, selectedMonth, updated)
    refreshProfileData(activeProfileId)
  }

  function handleAddYear(year) {
    addYearToData(activeProfileId, year)
    refreshProfileData(activeProfileId)
    setSelectedYear(year)
    setCurrentView('timeline')
    setSelectedMonth(null)
    setShowNewYearOverlay(false)
  }

  function handleAddMonth(month) {
    addMonthToData(activeProfileId, selectedYear, month)
    refreshProfileData(activeProfileId)
    setShowNewMonthOverlay(false)
  }

  function handleCreateBoard(boardObj) {
    const newData = addItemToRoot(boardsData, boardObj)
    saveBoardsData(activeProfileId, newData)
    setBoardsData(newData)
    setShowNewBoardOverlay(false)
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeProfileId={activeProfileId}
        onSwitchProfile={handleSwitchProfile}
        currentView={currentView}
        onNavigateToTimeline={handleNavigateToTimeline}
        onNavigateToBoards={handleNavigateToBoards}
        isOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="main-area">
        <TopBar
          currentView={currentView}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedBoard={selectedBoard}
          years={years}
          onYearChange={handleYearChange}
          onNavigateBack={handleNavigateBack}
          viewMode={viewMode}
          onToggleView={handleToggleView}
          onOpenBoardOverlay={() => setShowNewBoardOverlay(true)}
          onCreateYear={() => setShowNewYearOverlay(true)}
          onCreateMonth={() => setShowNewMonthOverlay(true)}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {currentView === 'timeline' && (
          <TimelineGrid
            yearData={yearData}
            selectedYear={selectedYear}
            onMonthClick={handleMonthClick}
            onCoverChange={handleCoverChange}
            viewMode={viewMode}
          />
        )}
        {currentView === 'month' && (
          <MonthDetail
            month={selectedMonth}
            year={selectedYear}
            monthData={currentMonthData}
            onSave={handleSaveBlocks}
            onSaveNotesDirect={handleSaveNotesDirect}
            onSaveTitleDirect={handleSaveTitleDirect}
          />
        )}
        {currentView === 'yourBoards' && (
          <BoardsView
            boardsData={boardsData}
            onBoardClick={handleBoardClick}
          />
        )}
        {currentView === 'boardDetail' && (
          <div className="board-detail-content">
            <h1 className="month-detail-title">{selectedBoard?.name}</h1>
          </div>
        )}
      </div>

      {showNewBoardOverlay && (
        <NewBoardOverlay
          onDone={handleCreateBoard}
          onCancel={() => setShowNewBoardOverlay(false)}
        />
      )}
      {showNewYearOverlay && (
        <NewYearOverlay
          existingYears={years}
          onDone={handleAddYear}
          onCancel={() => setShowNewYearOverlay(false)}
        />
      )}
      {showNewMonthOverlay && (
        <NewMonthOverlay
          existingMonths={existingMonths}
          onDone={handleAddMonth}
          onCancel={() => setShowNewMonthOverlay(false)}
        />
      )}
      {settingsOpen && (
        <SettingsOverlay
          activeProfileId={activeProfileId}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
