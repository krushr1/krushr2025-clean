import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/index.ts',
        'src/config/',
        'src/types/',
        'prisma/',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules/', 'dist/', 'uploads/', 'test.db*'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})