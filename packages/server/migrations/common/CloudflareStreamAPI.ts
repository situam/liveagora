
export class CloudflareStreamAPI {
  accountId: string
  apiToken: string
  constructor(
    accountId: string,
    apiToken: string
  ) {
    this.accountId = accountId
    this.apiToken = apiToken
  }

  async getVideoName(videoId: string): Promise<string> {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(`Failed to get video info for video ${videoId}: ${JSON.stringify(data.errors)}`)
    }
    return data.result?.meta?.name || videoId
  }

  async generateMp4Download(
    videoId: string,
  ): Promise<string> {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}/downloads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(`Failed to generate MP4 download for video ${videoId}: ${JSON.stringify(data.errors)}`)
    }
    //console.log(data)
    return data.result?.default?.url
  }
}