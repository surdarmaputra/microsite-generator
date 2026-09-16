# Microsite Generator

A TanStack Start application for creating and publishing microsites. Admins compose pages from blocks (hero, card, trimmed, CTA), publish them to public URLs, and the Netlify CDN caches each microsite indefinitely until the next publish purges the tag.

---

## Local dev setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values (see sections below for Supabase and Netlify details).

### 3. Run database migrations

```bash
bun run migrate
```

### 4. Start the dev server

```bash
bun run dev
```

The app starts at `http://localhost:3000`.

---

## Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In **Storage**, create a public bucket named `microsites`.
3. Under **Project Settings → Database**, copy the **Connection string (Pooler)** for `DATABASE_URL` and the **Direct connection** string for `DATABASE_URL_MIGRATE`.
4. Under **Project Settings → API → S3 Connection**, generate S3 access keys and copy them into `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`. Set `S3_ENDPOINT` to your project's S3 endpoint and `S3_REGION` to the matching region.
5. Set `PUBLIC_STORAGE_URL` to the public URL prefix for your bucket, e.g. `https://<project-id>.supabase.co/storage/v1/object/public/microsites`.

---

## Netlify setup

1. Create a new Netlify site linked to this repository.
2. Set the **Build command** to `bun run build` and the **Publish directory** to `.output/public`.
3. Add all environment variables from `.env.example` under **Site configuration → Environment variables**.
4. Note the **Site name** (e.g. `my-microsite-gen`) and **Site ID** — both are needed for GitHub Actions secrets.

### GitHub Actions secrets

Add the following secrets to your GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|---|---|
| `DATABASE_URL` | Supabase pooler connection string |
| `DATABASE_URL_MIGRATE` | Supabase direct connection string |
| `ADMIN_USERS` | Comma-separated `user:hash` pairs (see below) |
| `SESSION_SECRET` | Random 32+ character string |
| `S3_ENDPOINT` | Supabase S3 endpoint URL |
| `S3_REGION` | S3 region (e.g. `ap-southeast-1`) |
| `S3_ACCESS_KEY_ID` | Supabase S3 access key ID |
| `S3_SECRET_ACCESS_KEY` | Supabase S3 secret key |
| `S3_BUCKET` | `microsites` |
| `PUBLIC_STORAGE_URL` | Public bucket URL prefix |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Netlify site ID |
| `NETLIFY_SITE_NAME` | Netlify site name (subdomain part only) |
| `TEST_USERNAME` | Admin username used in e2e tests |
| `TEST_PASSWORD` | Admin password used in e2e tests |
| `TEST_ADMIN_HASH` | Bcrypt hash of `TEST_PASSWORD` for CI |
| `TEST_ADMIN_PASSWORD` | Plain-text password for e2e test login |
| `CODECOV_TOKEN` | Codecov upload token (optional) |

---

## First admin user

Hash a password with the built-in script and add the result to `ADMIN_USERS`:

```bash
bun run hash-password <your-password>
# outputs: $2b$12$...

# In .env.local:
ADMIN_USERS=yourname:$2b$12$...
```

Multiple admins are separated by commas:

```
ADMIN_USERS=alice:$2b$12$...,bob:$2b$12$...
```

---

## Running tests

### Unit tests (vitest, node environment)

```bash
bun run test
```

### Unit tests with coverage

```bash
bun run test:coverage
```

Coverage thresholds are set at 90 % for lines, functions, branches, and statements.

### Component tests (vitest browser mode, Playwright/Chromium)

```bash
bun run test:browser
```

### End-to-end tests (Playwright)

Requires a running app and a configured `.env.local`.

```bash
bun run dev &         # start the app first
bun run test:e2e
```

Set `TEST_USERNAME` and `TEST_PASSWORD` in the environment to match an admin account in `ADMIN_USERS`.

### Smoke tests (against a deployed URL)

```bash
BASE_URL=https://your-site.netlify.app bun run test:smoke
```

### Type checking

```bash
bun run typecheck
```

---

## Deploy

### Preview deploy (pull request)

Every pull request triggers the `deploy-preview` job in `.github/workflows/deploy.yml`, which:

1. Builds the app.
2. Deploys to Netlify at `https://pr-<number>--<site-name>.netlify.app`.
3. Runs smoke tests against the preview URL.

### Production deploy (main branch)

Merging to `main` triggers the `deploy-prod` job, which:

1. Runs database migrations.
2. Builds the app.
3. Deploys to Netlify production (`--prod`).

### Manual deploy

```bash
bun run build
bunx netlify deploy --prod --dir .output/public
```
