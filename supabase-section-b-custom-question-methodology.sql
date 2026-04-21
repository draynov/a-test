-- =========================================================
-- Section B - Move methodology to custom questions
-- Removes template-level methodology and adds per-question fields
-- =========================================================

DO $$
BEGIN
  ALTER TYPE "SectionRoman" ADD VALUE IF NOT EXISTS 'V';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "SectionBCustomQuestion"
  ADD COLUMN IF NOT EXISTS "scoreMethodology1" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology1_5" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology2" TEXT NOT NULL DEFAULT '';

-- NOTE:
-- The old template-level methodology columns are intentionally kept for now to avoid
-- destructive-change warnings and accidental data loss in production-like environments.
-- Run the dedicated cleanup script only after you verify everything works:
--   supabase-section-b-template-methodology-cleanup.sql