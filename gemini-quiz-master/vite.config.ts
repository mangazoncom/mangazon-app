import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Use relative paths for GitHub Pages compatibility
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process for other potential usages
      'process.env': env
    }
  }
})