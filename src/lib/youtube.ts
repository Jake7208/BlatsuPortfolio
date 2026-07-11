/**
 * Extracts the video id from any of YouTube's link shapes —
 * watch?v=, youtu.be/, /shorts/, /live/, /embed/ — or null if it isn't one.
 */
export function youtubeId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '')
  const idOk = (id: string | null | undefined) => (id && /^[\w-]{6,}$/.test(id) ? id : null)

  if (host === 'youtu.be') return idOk(parsed.pathname.split('/')[1])
  if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') return idOk(parsed.searchParams.get('v'))
    const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)
    return idOk(match?.[1])
  }
  return null
}
