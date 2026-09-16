import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
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
          browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
          },
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
