import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que Docker exponga el puerto correctamente
    port: 5173,
    watch: {
      usePolling: true, // Necesario para que detecte cambios en Windows/Mac con volúmenes
    },
  },
})