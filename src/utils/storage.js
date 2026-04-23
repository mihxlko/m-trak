export const GUEST_PROFILE_ID = 'guest'
const GUEST_DISPLAY_NAME = 'Alex Smith'

const PROFILES = [
  { id: 'mihxlko', displayName: 'mihxlko', email: 'mihxlko@email.com', avatar: 'images/avatars/avatar-mihxlko.png' },
  { id: GUEST_PROFILE_ID, displayName: GUEST_DISPLAY_NAME, email: 'example@email.com', avatar: `images/avatars/avatar-test-user-1.png` },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function storageFor(profileId) {
  return profileId === GUEST_PROFILE_ID ? sessionStorage : localStorage
}

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
  if (!sessionStorage.getItem('m-trakSessionStarted')) {
    sessionStorage.setItem('m-trakSessionStarted', 'true')
    localStorage.setItem(ACTIVE_PROFILE_KEY, GUEST_PROFILE_ID)
    return GUEST_PROFILE_ID
  }
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || GUEST_PROFILE_ID
}

export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
}

export function getProfileData(profileId) {
  const key = `m-trakData_${profileId}`
  const raw = storageFor(profileId).getItem(key)
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
  storageFor(profileId).setItem(`m-trakData_${profileId}`, JSON.stringify(data))
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

export function getSidebarOpen(profileId) {
  const val = storageFor(profileId).getItem(`aulosSidebarOpen_${profileId}`)
  return val === null ? true : val === 'true'
}

export function setSidebarOpen(profileId, value) {
  storageFor(profileId).setItem(`aulosSidebarOpen_${profileId}`, String(value))
}

export function initializeProfiles() {
  for (const profile of PROFILES) {
    const storage = storageFor(profile.id)
    const dataKey = `m-trakData_${profile.id}`
    const raw = storage.getItem(dataKey)
    if (!raw) {
      storage.setItem(dataKey, JSON.stringify(makeEmptyData()))
    } else {
      try {
        const parsed = JSON.parse(raw)
        // Migrate old format that lacks `years` wrapper
        if (!parsed.years) {
          storage.setItem(dataKey, JSON.stringify(makeEmptyData()))
        }
      } catch {
        storage.setItem(dataKey, JSON.stringify(makeEmptyData()))
      }
    }
    initializeBoardsData(profile.id)
  }
  if (!localStorage.getItem(ACTIVE_PROFILE_KEY)) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, GUEST_PROFILE_ID)
  }
}

// ── Boards ────────────────────────────────────────────────────────────────

export function getBoardsData(profileId) {
  const raw = storageFor(profileId).getItem(`${BOARDS_KEY_PREFIX}${profileId}`)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export function saveBoardsData(profileId, data) {
  storageFor(profileId).setItem(`${BOARDS_KEY_PREFIX}${profileId}`, JSON.stringify(data))
}

export function initializeBoardsData(profileId) {
  const key = `${BOARDS_KEY_PREFIX}${profileId}`
  const storage = storageFor(profileId)
  if (!storage.getItem(key)) {
    storage.setItem(key, JSON.stringify([]))
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

export function clearProfileData(profileId) {
  const storage = storageFor(profileId)
  storage.removeItem(`m-trakData_${profileId}`)
  storage.removeItem(`aulosProfile_${profileId}`)
  storage.removeItem(`aulosSidebarOpen_${profileId}`)
  storage.removeItem(`aulosTheme_${profileId}`)
  storage.removeItem(`${BOARDS_KEY_PREFIX}${profileId}`)
}

// ── Profile info (email, birthday) ───────────────────────────────────────────

export function getProfileInfo(profileId) {
  const fallbackEmail = PROFILES.find(p => p.id === profileId)?.email || ''
  const raw = storageFor(profileId).getItem(`aulosProfile_${profileId}`)
  if (!raw) return { email: fallbackEmail, birthday: { month: '', day: '' } }
  try {
    const parsed = JSON.parse(raw)
    return { ...parsed, email: parsed.email || fallbackEmail }
  } catch {
    return { email: fallbackEmail, birthday: { month: '', day: '' } }
  }
}

export function saveProfileInfo(profileId, info) {
  storageFor(profileId).setItem(`aulosProfile_${profileId}`, JSON.stringify(info))
}

// ── Theme preference ──────────────────────────────────────────────────────────

export function getThemePreference(profileId) {
  return storageFor(profileId).getItem(`aulosTheme_${profileId}`) || 'light'
}

export function saveThemePreference(profileId, theme) {
  storageFor(profileId).setItem(`aulosTheme_${profileId}`, theme)
}

export function exportProfileDataAsJSON(profileId) {
  const data = getProfileData(profileId)
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${profileId}-seed.json`
  a.click()
  URL.revokeObjectURL(url)
}

export { MONTHS }
