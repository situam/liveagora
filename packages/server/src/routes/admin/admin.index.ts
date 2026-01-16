import agoras from "./agoras/agoras.index.ts"
export const adminRoutes = [
  agoras
] as const

export type AdminAppType = typeof adminRoutes[number]