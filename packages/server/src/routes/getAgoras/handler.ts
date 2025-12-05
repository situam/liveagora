import type { Context } from "hono"
import { getAgoraPasswordRows } from "../../repo/agoraPasswords.ts"

export async function getAgoras(c: Context){
  try {
    const data = await getAgoraPasswordRows()
    return c.json(data, 200)
  } catch (err) {
    return c.status(500)
  }
}