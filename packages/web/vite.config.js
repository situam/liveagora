import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import eslintPlugin from 'vite-plugin-eslint'
import { REQUIRED_ENV_KEYS } from './src/config/requiredEnvKeys'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // validate env vars
  for (const key of REQUIRED_ENV_KEYS) {
    if (!(key in env)) {
      throw new Error(`Missing required env var: ${key}`)
    }
  }
  if (!env.VITE_BASE.endsWith('/')) {
    throw new Error("Invalid environment: invalid VITE_BASE")
  }

  return defineConfig({
    base: env.VITE_BASE,
    plugins: [
      react(),
      eslintPlugin({
        cache: false,
        include: ['./src/**/*.js', './src/**/*.jsx'],
        exclude: [],
      }),
    ],
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
  })
}