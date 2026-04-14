const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const BASE = 'https://ws.audioscrobbler.com/2.0'

export async function searchTracks(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `${BASE}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=5`
    )
    const data = await res.json()
    const tracks = data.results?.trackmatches?.track || []
    const seen = new Set()
    return tracks.filter(t => {
      const key = `${t.name.toLowerCase()}|${t.artist.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch (e) {
    console.error('searchTracks error:', e)
    return []
  }
}

export async function searchAlbums(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `${BASE}?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=5`
    )
    const data = await res.json()
    return data.results?.albummatches?.album || []
  } catch (e) {
    console.error('searchAlbums error:', e)
    return []
  }
}
