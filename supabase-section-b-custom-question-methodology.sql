-- =========================================================
-- Section B - Move methodology to custom questions
-- Removes template-level methodology and adds per-question fields
-- =========================================================

ALTER TABLE "SectionBCustomQuestion"
  ADD COLUMN IF NOT EXISTS "scoreMethodology1" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology1_5" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology2" TEXT NOT NULL DEFAULT '';

ALTER TABLE "SectionBTemplate"
  DROP COLUMN IF EXISTS "scoreMethodology1",
  DROP COLUMN IF EXISTS "scoreMethodology1_5",
  DROP COLUMN IF EXISTS "scoreMethodology2";