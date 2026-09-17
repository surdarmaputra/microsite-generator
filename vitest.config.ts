import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['tests/e2e/**', 'tests/smoke/**', 'node_modules/**'],
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
          coverage: {
            include: ['app/lib/**', 'app/server/**'],
            thresholds: {
              lines: 90,
              functions: 90,
              branches: 90,
              statements: 90,
            },
          },
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/component/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
  },
  resolve: {
    alias: {
      '~': '/app',
    },
  },
})
