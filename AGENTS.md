# microsite-generator

## Stack

- **TanStack Start** (React 19) + **bun**
- **drizzle-orm** + **postgres-js** + **Supabase Postgres** (pooler 6543 / migrate 5432)
- **Supabase Storage** via S3 API
- **Netlify** + `@netlify/vite-plugin-tanstack-start` + `purgeCache`
- **Tailwind v4** + **shadcn/Radix** + **Lexical** editor + **sortablejs** + **motion**
- **zod** + **sanitize-html** + **bcryptjs** + `useSession` (vinxi)

## Key rules

- **Migrations additive-only** — never drop or rename columns in a migration. Add new columns nullable; backfill separately.
- **Slug locked** after `first_published_at` is set. Reserved slugs: `admin`, `api`, `assets`, `.netlify`.
- **Sanitize on save** — every `html` field in `saveDraft` must be sanitized through `app/lib/sanitize.ts`.
- **Cache headers** — public routes must set `Netlify-CDN-Cache-Control`, `Cache-Control`, and `Netlify-Vary` as specified in `app/lib/cache.ts`.
- **Purge on publish/unpublish/delete** — always call `purgeByTag(slug)` after mutating live state.

## Local dev

```bash
cp .env.example .env.local
# fill in DB + S3 + auth env vars
bun install
bun run migrate         # runs drizzle-kit migrate against DATABASE_URL_MIGRATE
bun run dev             # vinxi dev server on http://localhost:3000
bun run hash-password   # generate bcrypt hash for ADMIN_USERS
```

## Environment variables

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | pooler URL (port 6543) with `?sslmode=require` |
| `DATABASE_URL_MIGRATE` | direct URL (port 5432) for migrations |
| `ADMIN_USERS` | `user:bcryptHash,user2:hash2` |
| `SESSION_SECRET` | random 32+ char string; rotate → logout all |
| `S3_ENDPOINT` | Supabase S3 endpoint |
| `S3_REGION` | `ap-southeast-1` (match Supabase project region) |
| `S3_ACCESS_KEY_ID` | Supabase S3 access key |
| `S3_SECRET_ACCESS_KEY` | Supabase S3 secret |
| `S3_BUCKET` | Supabase storage bucket name (must be public) |
| `PUBLIC_STORAGE_URL` | Public URL prefix for storage (e.g. `https://xxx.supabase.co/storage/v1/object/public/bucket`) |

## File structure

```
app/
  lib/          # shared pure utilities (doc types, auth, sanitize, cache)
  server/
    db/         # drizzle schema + db client
    fns/        # createServerFn handlers (sites, auth, upload)
  routes/       # TanStack Start file-based routes
  components/
    blocks/     # public block renderers (Hero, Card, Trimmed, CTA)
    editor/     # admin Lexical editor + nodes
    admin/      # admin-specific components
    ui/         # shadcn primitives
tests/
  unit/         # vitest unit tests
  component/    # vitest browser component tests
  e2e/          # Playwright e2e tests
  smoke/        # Playwright smoke tests vs deployed preview
.github/workflows/
scripts/
```

## Skills

- `/conventional-commit` — format commit + update PR title/description
- `/grill-me` — stress-test a design or plan before building

## CI / deploy

See `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`. Netlify auto-build is **off** — GHA deploys via `netlify deploy`.

Coverage target: ≥90% on `sanitize`, `doc`, `auth`, `publish` modules.
