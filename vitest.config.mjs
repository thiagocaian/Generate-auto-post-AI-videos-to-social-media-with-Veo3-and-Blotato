import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/security/**/*.test.ts', 'lib/validation/**/*.test.ts'],
  },
})
