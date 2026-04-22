-- =========================================================
-- STEP 1: Enum expansion ONLY (run this first)
-- =========================================================

-- Ensure AttestationCardType supports all required values
DO $$
BEGIN
  ALTER TYPE "AttestationCardType" ADD VALUE IF NOT EXISTS 'EDUCATOR';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "AttestationCardType" ADD VALUE IF NOT EXISTS 'DEPUTY_DIRECTOR';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "AttestationCardType" ADD VALUE IF NOT EXISTS 'PSYCHOLOGIST_COUNSELOR';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "AttestationCardType" ADD VALUE IF NOT EXISTS 'REHABILITATOR_TRAINER';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure SectionRoman supports V
DO $$
BEGIN
  ALTER TYPE "SectionRoman" ADD VALUE IF NOT EXISTS 'V';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure per-question methodology columns exist
ALTER TABLE "SectionBCustomQuestion"
  ADD COLUMN IF NOT EXISTS "scoreMethodology1" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology1_5" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "scoreMethodology2" TEXT NOT NULL DEFAULT '';
