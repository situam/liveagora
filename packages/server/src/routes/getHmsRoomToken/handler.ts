import type { Context } from "hono"
import { generateHmsUserToken } from "./generateHmsRoomToken.ts"

// TODO: share types and better validation
export async function getHmsRoomToken(c: Context) {
  try {
    const { room_id, user_id, role } = await c.req.json()

    if (!room_id || !user_id || !role)
      throw Error('invalid request (must contain room_id, user_id, role)')

    console.log("[getHmsRoomToken] Request to join from", user_id, role)

    const token = generateHmsUserToken(room_id, user_id, role)

    return c.json(
      { token, success: true, msg: "" },
      200
    )
  } catch (err) {
    console.error("[getHmsRoomToken] Error:", err)
    
    return c.json(
      { error: String(err), success: false, msg: String(err) },
      400
    )
  }
}