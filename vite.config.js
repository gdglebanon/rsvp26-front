import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react()],
    // Root hosting in production; preserve the current local development URL.
    base: env.VITE_BASE_PATH || (command === 'serve' ? '/rsvp-gdg/' : '/'),
    server: {
      fs: { deny: ['.env', '.env.*', '*firebase-adminsdk*.json', '*serviceaccount*.json', '*service-account*.json', '**/.git/**'] }
    },
  }
})
