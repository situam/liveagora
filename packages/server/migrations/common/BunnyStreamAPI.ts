
export class BunnyStreamAPI {
  libraryId: string
  apiKey: string
  videoLibraryPullZone: string

  constructor(libraryId: string, apiKey: string, videoLibraryPullZone: string) {
    this.libraryId = libraryId
    this.apiKey = apiKey
    this.videoLibraryPullZone = videoLibraryPullZone
  }

  // https://docs.bunny.net/api-reference/stream/manage-videos/fetch-video
  async fetchVideo(url: string, title: string | null = null) {
    const options = {
      method: 'POST',
      headers: { AccessKey: this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, headers: {}, title: title })
    };

    const res = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/videos/fetch`, options)
    if (!res.ok) throw new Error(`Failed to fetch video from Bunny Stream API: ${res.status} ${res.statusText}`)

    const data = await res.json()
    return data?.id
  }

  buildHlsUrl(videoId: string) {
    return `https://${this.videoLibraryPullZone}.b-cdn.net/${videoId}/playlist.m3u8`
  }
}