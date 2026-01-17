import agoras from "./admin/agoras/agoras.index.ts"
import app from "./app/app.index.ts"
export const routes = [
  agoras,
  app,
] as const

export type ApiType = typeof routes[number]