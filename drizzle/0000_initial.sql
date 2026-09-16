CREATE TABLE IF NOT EXISTS "microsites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "draft_doc" jsonb NOT NULL,
  "live_doc" jsonb,
  "draft_version" integer NOT NULL DEFAULT 1,
  "draft_updated_at" timestamptz,
  "published_at" timestamptz,
  "first_published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
