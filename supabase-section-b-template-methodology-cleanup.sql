-- =========================================================
-- Section B - Cleanup old template-level methodology columns
-- Run ONLY after validating the new per-question methodology flow
-- =========================================================

ALTER TABLE "SectionBTemplate"
  DROP COLUMN IF EXISTS "scoreMethodology1",
  DROP COLUMN IF EXISTS "scoreMethodology1_5",
  DROP COLUMN IF EXISTS "scoreMethodology2";
