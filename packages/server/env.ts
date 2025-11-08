import 'dotenv/config'

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const env = {
  port: Number(required('PORT')),
  routePrefix: required('ROUTE_PREFIX'),
  corsOrigin: required('CORS_ORIGIN'),
  cloudflareImagesAccountId: required('CLOUDFLARE_IMAGES_ACCOUNT_ID'),
  cloudflareStreamAccountId: required('CLOUDFLARE_STREAM_ACCOUNT_ID'),
  apiTokenCloudflareStreamImages: required('API_TOKEN_CLOUDFLARE_STREAM_IMAGES'),
}