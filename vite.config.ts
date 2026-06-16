import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // The repo lives on the Windows filesystem (/mnt/c) accessed from WSL,
    // where inotify events don't fire — poll so HMR detects file changes.
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})
