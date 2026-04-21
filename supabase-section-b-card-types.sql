-- =========================================================
-- Section B - AttestationCardType expansion
-- Adds the remaining card types to the existing enum
-- =========================================================

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
