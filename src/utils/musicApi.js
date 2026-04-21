const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const BASE = 'https://ws.audioscrobbler.com/2.0'

export async function searchTracks(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `${BASE}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=8`
    )
    const data = await res.json()
    return data.results?.trackmatches?.track || []
  } catch (err) {
    console.error('searchTracks failed:', err)
    return []
  }
}

export async function searchAlbums(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `${BASE}?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=8`
    )
    const data = await res.json()
    return data.results?.albummatches?.album || []
  } catch (err) {
    console.error('searchAlbums failed:', err)
    return []
  }
}