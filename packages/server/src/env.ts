import 'dotenv/config'

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const env = {
  adminPassword: required('ADMIN_PASSWORD'),
  pathToDb: required('PATH_TO_DB'),
  port: Number(required('PORT')),
  routePrefix: required('ROUTE_PREFIX'),
  corsOrigin: required('CORS_ORIGIN'),
  hmsAppAccessKey: required('100MS_APP_ACCESS_KEY'),
  hmsAppSecret: required('100MS_APP_SECRET'),
  s3: {
    endpoint: required('OBJECT_STORAGE_ENDPOINT'),
    region: required('OBJECT_STORAGE_DEFAULT_REGION'),
    bucket: required('OBJECT_STORAGE_BUCKET'),
    accessKeyId: required('OBJECT_STORAGE_ACCESS_KEY_ID'),
    secretAccessKey: required('OBJECT_STORAGE_SECRET_ACCESS_KEY'),
  },
  bunnyStream: {
    videoLibraryId: Number(required('BUNNY_VIDEO_LIBRARY_ID')),
    videoLibraryAccessKey: required('BUNNY_VIDEO_LIBRARY_ACCESS_KEY'),
    videoLibraryPullZone: required('BUNNY_VIDEO_LIBRARY_PULL_ZONE'),
  }
}