import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // validate env vars
  if (!env.VITE_BASE || !env.VITE_BASE.endsWith('/')) {
    throw new Error("Invalid environment: Missing/invalid VITE_BASE")
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