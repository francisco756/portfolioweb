import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Multi-page: one HTML shell per case study (content comes from src/data/cases.ts).
export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        leadi: resolve(__dirname, 'cases/leadi.html'),
        'nomad-sushi': resolve(__dirname, 'cases/nomad-sushi.html'),
        'multiphone-chile': resolve(__dirname, 'cases/multiphone-chile.html'),
      },
    },
  },
})
