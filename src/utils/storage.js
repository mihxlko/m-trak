const PROFILES = [
  { id: 'mihxlko', displayName: 'mihxlko', avatar: 'images/avatars/mihvlko.jpg' },
  { id: 'Test User', displayName: 'Test User', avatar: null },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const ACTIVE_PROFILE_KEY = 'm-trakActiveProfile'
const VIEW_PREFERENCE_KEY = 'm-trakViewPreference'
const BOARDS_KEY_PREFIX = 'm-trakBoards_'

// New data model: { years: { "2026": { "January": { songs, coverImage }, ... }, ... } }
// Only years/months the user created exist, except the current calendar year is auto-created.
function makeEmptyData() {
  const currentYear = String(new Date().getFullYear())
  return { years: { [currentYear]: {} } }
}

export function getProfiles() {
  return PROFILES
}

export function getActiveProfile() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'Test User'
}

export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
}

export function getProfileData(profileId) {
  const key = `m-trakData_${profileId}`
  const raw = localStorage.getItem(key)
  if (!raw) return makeEmptyData()
  try {
    const parsed = JSON.parse(raw)
    // Migrate old format (no `years` wrapper) → wipe and reinit
    if (!parsed.years) return makeEmptyData()
    return parsed
  } catch {
    return makeEmptyData()
  }
}

export function saveProfileData(profileId, data) {
  localStorage.setItem(`m-trakData_${profileId}`, JSON.stringify(data))
}

function migrateMonthData(raw) {
  if (!raw) return { blocks: [], coverImage: null }
  // Already migrated
  if (Array.isArray(raw.blocks)) return raw
  // Legacy: had top-level songs array
  const songs = Array.isArray(raw.songs) ? raw.songs : []
  const blocks = songs.length > 0
    ? [{ id: crypto.randomUUID(), type: 'songs', title: 'Songs', titleVisible: true, items: songs }]
    : []
  return { blocks, coverImage: raw.coverImage || null }
}

export function getMonthData(profileId, year, month) {
  const data = getProfileData(profileId)
  const raw = data?.years?.[year]?.[month]
  const migrated = migrateMonthData(raw)
  // Write back immediately if migration happened
  if (raw && !Array.isArray(raw.blocks)) {
    saveMonthData(profileId, year, month, migrated)
  }
  return migrated
}

export function saveMonthData(profileId, year, month, monthData) {
  const data = getProfileData(profileId)
  if (!data.years) data.years = {}
  if (!data.years[year]) data.years[year] = {}
  data.years[year][month] = monthData
  saveProfileData(profileId, data)
}

export function addYearToData(profileId, year) {
  const data = getProfileData(profileId)
  if (!data.years) data.years = {}
  if (!data.years[year]) data.years[year] = {}
  saveProfileData(profileId, data)
}

export function addMonthToData(profileId, year, month) {
  const data = getProfileData(profileId)
  if (!data.years) data.years = {}
  if (!data.years[year]) data.years[year] = {}
  if (!data.years[year][month]) {
    data.years[year][month] = { blocks: [], coverImage: null }
  }
  saveProfileData(profileId, data)
}

export function getViewPreference() {
  return localStorage.getItem(VIEW_PREFERENCE_KEY) || 'grid'
}

export function setViewPreference(view) {
  localStorage.setItem(VIEW_PREFERENCE_KEY, view)
}

export function initializeProfiles() {
  for (const profile of PROFILES) {
    const dataKey = `m-trakData_${profile.id}`
    const raw = localStorage.getItem(dataKey)
    if (!raw) {
      localStorage.setItem(dataKey, JSON.stringify(makeEmptyData()))
    } else {
      try {
        const parsed = JSON.parse(raw)
        // Migrate old format that lacks `years` wrapper
        if (!parsed.years) {
          localStorage.setItem(dataKey, JSON.stringify(makeEmptyData()))
        }
      } catch {
        localStorage.setItem(dataKey, JSON.stringify(makeEmptyData()))
      }
    }
    initializeBoardsData(profile.id)
  }
  if (!localStorage.getItem(ACTIVE_PROFILE_KEY)) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, 'Test User')
  }
}

// ── Boards ────────────────────────────────────────────────────────────────

export function getBoardsData(profileId) {
  const raw = localStorage.getItem(`${BOARDS_KEY_PREFIX}${profileId}`)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export function saveBoardsData(profileId, data) {
  localStorage.setItem(`${BOARDS_KEY_PREFIX}${profileId}`, JSON.stringify(data))
}

export function initializeBoardsData(profileId) {
  const key = `${BOARDS_KEY_PREFIX}${profileId}`
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]))
  }
}

export function findBoardById(data, id) {
  for (const item of data) {
    if (item.id === id) return item
    if (item.type === 'folder' && item.children) {
      const found = findBoardById(item.children, id)
      if (found) return found
    }
  }
  return null
}

export function updateBoardById(data, id, updates) {
  return data.map(item => {
    if (item.id === id) return { ...item, ...updates }
    if (item.type === 'folder' && item.children) {
      return { ...item, children: updateBoardById(item.children, id, updates) }
    }
    return item
  })
}

export function deleteBoardById(data, id) {
  return data
    .filter(item => item.id !== id)
    .map(item => {
      if (item.type === 'folder' && item.children) {
        return { ...item, children: deleteBoardById(item.children, id) }
      }
      return item
    })
}

export function addItemToFolder(data, folderId, newItem) {
  return data.map(item => {
    if (item.id === folderId && item.type === 'folder') {
      return { ...item, children: [...(item.children || []), newItem] }
    }
    if (item.type === 'folder' && item.children) {
      return { ...item, children: addItemToFolder(item.children, folderId, newItem) }
    }
    return item
  })
}

export function addItemToRoot(data, newItem) {
  return [...data, newItem]
}

export { MONTHS }
