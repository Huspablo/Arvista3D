import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals:     true,
    coverage: {
      provider: 'v8',
      include:  ['lib/services/**'],
      reporter: ['text', 'lcov'],
    },
  },
})
