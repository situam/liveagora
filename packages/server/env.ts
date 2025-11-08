import 'dotenv/config'

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const env = {
  port: Number(required('PORT')),
  routePrefix: required('ROUTE_PREFIX'),
}