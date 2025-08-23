import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  define: {
    // Allow access to process.env in the browser
    'process.env': {}
  }
})
