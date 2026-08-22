import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// O front chama /api/** (relativo) e o Vite repassa para a API .NET — local (:8080) por padrão,
// ou para o Kong da AWS via VITE_API_PROXY_TARGET (ver .env.example). Sem CORS em dev.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': { target: apiProxyTarget, changeOrigin: true, secure: false },
      },
    },
  }
})
