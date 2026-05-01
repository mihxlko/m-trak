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

const MB_BASE = 'https://musicbrainz.org/ws/2'
const MB_HEADERS = { 'User-Agent': 'm-trak/2.0 (contact@m-trak.app)' }

export async function getTrackInfo(trackName, artistName) {
  try {
    const query = `recording:"${trackName}" AND artist:"${artistName}"`
    const res = await fetch(
      `${MB_BASE}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=1`,
      { headers: MB_HEADERS }
    )
    const data = await res.json()
    const recording = data.recordings?.[0]
    if (!recording) return null
    const release = recording.releases?.[0]
    return {
      album: release?.title || '',
      releaseId: release?.id || null,
      artist: recording['artist-credit']?.[0]?.name || artistName,
    }
  } catch (err) {
    console.error('getTrackInfo failed:', err)
    return null
  }
}

export async function getCoverArt(releaseId) {
  if (!releaseId) return null
  try {
    const res = await fetch(`https://coverartarchive.org/release/${releaseId}`)
    const data = await res.json()
    const front = data.images?.find(img => img.front)
    return front?.thumbnails?.['500'] || front?.thumbnails?.large || front?.image || null
  } catch (err) {
    console.error('getCoverArt failed:', err)
    return null
  }
}

export async function getAlbumCoverArt(albumName, artistName) {
  try {
    const query = `release:"${albumName}" AND artist:"${artistName}"`
    const res = await fetch(
      `${MB_BASE}/release?query=${encodeURIComponent(query)}&fmt=json&limit=1`,
      { headers: MB_HEADERS }
    )
    const data = await res.json()
    const releaseId = data.releases?.[0]?.id
    if (!releaseId) return null
    return await getCoverArt(releaseId)
  } catch (err) {
    console.error('getAlbumCoverArt failed:', err)
    return null
  }
}