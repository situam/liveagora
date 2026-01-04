import type { Context } from 'hono'
import { env } from '../env.ts'
import { canEdit } from '../auth/auth.ts'
import { DocumentNames } from '@liveagora/common'

/**
 * middleware that validates "Authorization: Basic <base64(user:pass)>"
 * returns 401 if invalid
 */
export async function requireAdminAuth(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('authorization') ?? ''
  if (!authHeader.startsWith('Basic ')) {
    return c.body(null, 401)
  }

  const base64Credentials = authHeader.slice(6).trim()
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = decoded.split(':')

  if (username !== 'admin' || password !== env.adminPassword) {
    return c.body(null, 401)
  }

  await next()
}

export async function requireAgoraEditAuth(c: Context, next: () => Promise<void>) {
  const { agoraId } = c.req.param()
  if (!agoraId) return c.body(null, 400)

  const authHeader = c.req.header('authorization') ?? ''
  if (!authHeader.startsWith('Basic ')) {
    return c.body(null, 401)
  }

  const base64Credentials = authHeader.slice(6).trim()
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = decoded.split(':')

  if (username !== agoraId || !canEdit(password, DocumentNames.buildAgoraDoc(agoraId))) {
    return c.body(null, 401)
  }

  await next()
}
