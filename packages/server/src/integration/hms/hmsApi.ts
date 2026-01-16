import jwt from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";
import { env } from "../../env.ts";

class HmsAPI {
  generateManagementToken(
    access_key: string = env.hmsAppAccessKey,
    app_secret: string = env.hmsAppSecret,
  ): string {
    var payload = {
      access_key,
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    }

    return jwt.sign(payload, app_secret, {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: uuid4(),
    })
  }

  /**
   * See https://www.100ms.live/docs/server-side/v2/api-reference/Rooms/create-via-api
   * @returns Room ID on success
   * @throws on failure
   */
  async createRoom(
    agoraName: string
  ): Promise<string> {
    console.log(`[HmsApi.createRoom] agora: ${agoraName}`)
    const token = this.generateManagementToken()
    const args = {
      name: agoraNameToHmsRoomName(agoraName),
      description: `Room for Live Agora ${agoraName}`,
      // template_id not specified - uses the default template
    }
    
    const res = await fetch("https://api.100ms.live/v2/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(args),
    })

    if (!res.ok) {
      let errorInfo = ''
      try {
        errorInfo = await res.json()
      } catch (e) {
        // ignore
      }
      throw new Error(`[HmsApi.createRoom] error: HTTP ${res.status} ${errorInfo}`)
    }

    const { id: roomId } = await res.json()
    console.log(`[HmsApi.createRoom] room ID: ${roomId}`)
    return roomId
  }
}

// Accepted characters are a-z, A-Z, 0-9, and . - : _
function agoraNameToHmsRoomName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._:-]/g, '_')
}

export const hmsAPI = new HmsAPI()