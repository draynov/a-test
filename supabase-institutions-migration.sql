-- =========================================================
-- Institutions migration (manual, idempotent)
-- Run in Supabase SQL Editor
-- =========================================================

-- 1) Create Institution table
CREATE TABLE IF NOT EXISTS "Institution" (
  "id" TEXT NOT NULL,
  "neispuoCode" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "municipality" VARCHAR(100) NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- 2) Constraints / indexes for Institution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Institution_neispuoCode_key'
  ) THEN
    ALTER TABLE "Institution"
      ADD CONSTRAINT "Institution_neispuoCode_key" UNIQUE ("neispuoCode");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Institution_createdBy_idx"
  ON "Institution"("createdBy");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Institution_createdBy_fkey'
  ) THEN
    ALTER TABLE "Institution"
      ADD CONSTRAINT "Institution_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "User"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 3) Link SectionBTemplate -> Institution
ALTER TABLE "SectionBTemplate"
  ADD COLUMN IF NOT EXISTS "institutionId" TEXT;

CREATE INDEX IF NOT EXISTS "SectionBTemplate_institutionId_idx"
  ON "SectionBTemplate"("institutionId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SectionBTemplate_institutionId_fkey'
  ) THEN
    ALTER TABLE "SectionBTemplate"
      ADD CONSTRAINT "SectionBTemplate_institutionId_fkey"
      FOREIGN KEY ("institutionId") REFERENCES "Institution"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
