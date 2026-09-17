import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL_MIGRATE']!,
  },
  verbose: true,
  strict: true,
})
