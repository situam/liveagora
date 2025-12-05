import type { Context } from 'hono'
import { env } from '../env.ts'

/**
 * middleware that validates "Authorization: Bearer <token>"
 * returns 401 if invalid
 */
export async function requireAdminToken(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null

  if (!token || token !== env.adminToken) {
    return c.body(null, 401)
  }

  await next()
}
