import { OpenAPIHono } from '@hono/zod-openapi'
import { defaultHook } from './defaultHook.ts'

export function createRouter(basePath: string = '') {
  return new OpenAPIHono({
    defaultHook,
  }).basePath(basePath)
}