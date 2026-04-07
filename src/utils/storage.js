const PROFILES = [
  { id: 'mihvlko', displayName: 'mihvlko', avatar: 'images/avatars/mihvlko.jpg' },
  { id: 'test-user-1', displayName: 'test-user-1', avatar: null },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEARS = ['2025', '2026']

const ACTIVE_PROFILE_KEY = 'aulosActiveProfile'
const VIEW_PREFERENCE_KEY = 'aulosViewPreference'

function makeEmptyData() {
  const data = {}
  for (const year of YEARS) {
    data[year] = {}
    for (const month of MONTHS) {
      data[year][month] = { songs: [], coverImage: null }
    }
  }
  return data
}

export function getProfiles() {
  return PROFILES
}

export function getActiveProfile() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'mihvlko'
}

export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
}

export function getProfileData(profileId) {
  const key = `aulosData_${profileId}`
  const raw = localStorage.getItem(key)
  if (!raw) return makeEmptyData()
  try {
    return JSON.parse(raw)
  } catch {
    return makeEmptyData()
  }
}

export function saveProfileData(profileId, data) {
  const key = `aulosData_${profileId}`
  localStorage.setItem(key, JSON.stringify(data))
}

export function getMonthData(profileId, year, month) {
  const data = getProfileData(profileId)
  return data?.[year]?.[month] || { songs: [], coverImage: null }
}

export function saveMonthData(profileId, year, month, monthData) {
  const data = getProfileData(profileId)
  if (!data[year]) data[year] = {}
  if (!data[year][month]) data[year][month] = { songs: [], coverImage: null }
  data[year][month] = monthData
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
    const key = `aulosData_${profile.id}`
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(makeEmptyData()))
    }
  }
  if (!localStorage.getItem(ACTIVE_PROFILE_KEY)) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, 'mihvlko')
  }
}
