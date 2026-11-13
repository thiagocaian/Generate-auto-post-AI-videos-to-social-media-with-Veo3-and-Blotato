import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': root,
    },
  },
  test: {
    include: [
      'lib/security/**/*.test.ts',
      'lib/validation/**/*.test.ts',
      'lib/inbound/**/*.test.ts',
      'lib/notify.test.ts',
      'agents/fulfilment/**/*.test.ts',
    ],
  },
})
